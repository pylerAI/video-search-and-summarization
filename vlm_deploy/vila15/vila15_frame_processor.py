import os
import sys
import torch
from PIL import Image
import torchvision.transforms as transforms
from loguru import logger

sys.path.append(os.path.dirname(__file__) + "/VILA")

class VilaFrameProcessor:
    """Frame processor that mimics the original DecoderProcess preprocessing for VILA"""
    
    def __init__(self, model_path: str):
        self.model_path = model_path
        self._init_preprocessing_params()
    
    def _init_preprocessing_params(self):
        """Initialize preprocessing parameters based on VILA model config"""
        try:
            logger.info(f"Initializing frame processor for model: {self.model_path}")
            
            # Import VILA components
            import llava.model.language_model.llava_llama  # noqa: F401
            from llava.model.multimodal_encoder.intern_encoder import InternVisionPreprocessor
            from transformers import AutoModel
            from transformers.models.siglip.image_processing_siglip import SiglipImageProcessor
            
            # Load model to meta device to get preprocessing parameters
            device_map = {
                "model.vision_tower": "meta",
                "model.embed_tokens": "meta", 
                "model.layers": "meta",
                "model.norm": "meta",
                "lm_head": "meta",
                "model.mm_projector": "meta",
            }
            
            logger.debug("Loading model for preprocessing parameter extraction...")
            model = AutoModel.from_pretrained(
                self.model_path,
                low_cpu_mem_usage=True,
                device_map=device_map,
            )
            
            # Get image processor from vision tower
            image_processor = model.get_vision_tower().image_processor
            logger.debug(f"Image processor type: {type(image_processor)}")
            
            # Set preprocessing parameters based on processor type
            if isinstance(image_processor, InternVisionPreprocessor):
                self._shortest_edge = [
                    image_processor.size["height"],
                    image_processor.size["width"],
                ]
                self._rescale_factor = 1 / 255.0
                self._image_mean = (0.485, 0.456, 0.406)
                self._image_std = (0.229, 0.224, 0.225)
                self._crop_height = None
                self._crop_width = None
                self._do_preprocess = True
                
            elif isinstance(image_processor, SiglipImageProcessor):
                self._image_mean = image_processor.image_mean
                self._rescale_factor = image_processor.rescale_factor
                self._image_std = image_processor.image_std
                
                if hasattr(image_processor, "crop_size"):
                    self._crop_height = image_processor.crop_size["height"]
                    self._crop_width = image_processor.crop_size["width"]
                else:
                    self._crop_height = None
                    self._crop_width = None
                    
                if "shortest_edge" in image_processor.size:
                    self._shortest_edge = image_processor.size["shortest_edge"]
                elif "width" in image_processor.size and "height" in image_processor.size:
                    self._shortest_edge = [
                        image_processor.size["height"],
                        image_processor.size["width"],
                    ]
                else:
                    self._shortest_edge = None
                    
                self._do_preprocess = True
                self._image_aspect_ratio = getattr(model.config, 'image_aspect_ratio', 'pad')
            else:
                logger.warning(f"Unknown image processor type: {type(image_processor)}")
                # Set default values
                self._shortest_edge = 224
                self._rescale_factor = 1.0 / 255.0
                self._image_mean = (0.48145466, 0.4578275, 0.40821073)
                self._image_std = (0.26862954, 0.26130258, 0.27577711)
                self._crop_height = 224
                self._crop_width = 224
                self._do_preprocess = True
                self._image_aspect_ratio = 'pad'
            
            # Clean up
            del model
            torch.cuda.empty_cache()
            
            logger.info(f"Preprocessing params - mean: {self._image_mean}, std: {self._image_std}")
            logger.info(f"Preprocessing params - shortest_edge: {self._shortest_edge}, crop: {self._crop_height}x{self._crop_width}")
            
        except Exception as e:
            logger.error(f"Failed to initialize preprocessing parameters: {str(e)}")
            # Fallback to default CLIP preprocessing
            logger.warning("Using fallback CLIP preprocessing parameters")
            self._shortest_edge = 224
            self._rescale_factor = 1.0 / 255.0
            self._image_mean = (0.48145466, 0.4578275, 0.40821073)
            self._image_std = (0.26862954, 0.26130258, 0.27577711)
            self._crop_height = 224
            self._crop_width = 224
            self._do_preprocess = True
            self._image_aspect_ratio = 'pad'
    
    def process_image(self, pil_image: Image.Image) -> torch.Tensor:
        """
        Process PIL image to tensor format expected by Vila15EmbeddingGenerator
        
        Args:
            pil_image: PIL Image object
            
        Returns:
            torch.Tensor in format expected by VILA embedding generator
        """
        try:
            logger.debug(f"Processing image: {type(pil_image)}, size: {pil_image.size}, mode: {pil_image.mode}")
            
            # Convert to RGB if needed
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
                logger.debug(f"Converted to RGB: {pil_image.mode}")
            
            # Build preprocessing transforms based on VILA model parameters
            transform_list = []
            
            # Resize based on shortest edge or crop size
            if self._shortest_edge:
                if isinstance(self._shortest_edge, list):
                    # Use the first dimension as target size
                    target_size = self._shortest_edge[0]
                else:
                    target_size = self._shortest_edge
                transform_list.append(transforms.Resize(target_size))
                logger.debug(f"Added resize transform: {target_size}")
            
            # Center crop if specified
            if self._crop_height and self._crop_width:
                transform_list.append(transforms.CenterCrop((self._crop_height, self._crop_width)))
                logger.debug(f"Added crop transform: {self._crop_height}x{self._crop_width}")
            
            # Convert to tensor
            transform_list.append(transforms.ToTensor())
            
            # Apply rescaling if specified
            if self._rescale_factor and self._rescale_factor != 1.0:
                # ToTensor already scales to [0,1], so apply additional rescaling if needed
                transform_list.append(transforms.Lambda(lambda x: x * self._rescale_factor / (1/255.0)))
                logger.debug(f"Added rescaling: {self._rescale_factor}")
            
            # Normalize
            if self._image_mean and self._image_std:
                transform_list.append(transforms.Normalize(
                    mean=self._image_mean,
                    std=self._image_std
                ))
                logger.debug(f"Added normalization: mean={self._image_mean}, std={self._image_std}")
            
            # Compose all transforms
            transform = transforms.Compose(transform_list)
            
            # Apply transforms
            logger.debug("Applying transforms...")
            tensor = transform(pil_image)
            
            # Add batch dimension and move to GPU with correct dtype
            tensor = tensor.unsqueeze(0).to('cuda', dtype=torch.float16)
            
            logger.debug(f"Final tensor: shape={tensor.shape}, dtype={tensor.dtype}, device={tensor.device}")
            return tensor
            
        except Exception as e:
            logger.error(f"Error in process_image: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise
    
    def get_preprocessing_info(self) -> dict:
        """Get current preprocessing parameters"""
        return {
            "shortest_edge": getattr(self, "_shortest_edge", None),
            "crop_height": getattr(self, "_crop_height", None),
            "crop_width": getattr(self, "_crop_width", None),
            "rescale_factor": getattr(self, "_rescale_factor", None),
            "image_mean": getattr(self, "_image_mean", None),
            "image_std": getattr(self, "_image_std", None),
            "image_aspect_ratio": getattr(self, "_image_aspect_ratio", None),
        }
    