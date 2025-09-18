from loguru import logger
import io
import base64
import requests
from PIL import Image
from urllib.parse import urlparse
from pathlib import Path
import mimetypes


def load_image(image_url: str, preprocess: bool = False) -> Image.Image:
    """
    Load and optionally preprocess image for VILA model.
    
    Args:
        image_url: URL, base64 data URI, or local file path
        preprocess: Whether to preprocess image for VILA model
        
    Returns:
        PIL Image object
    """
    # Load the image
    if image_url.startswith('data:'):
        image = _load_image_from_base64(image_url)
    elif image_url.startswith(('http://', 'https://')):
        image = _load_image_from_url(image_url)
    else:
        image = _load_image_from_file(image_url)
    
    # Optionally preprocess for VILA
    if preprocess:
        image = preprocess_image_for_vila(image)
    
    return image

def _load_image_from_base64(data_url: str) -> Image.Image:
    """
    Load image from base64 data URL.
    
    Args:
        data_url: Base64 data URL (e.g., "data:image/jpeg;base64,...")
        
    Returns:
        PIL Image object
    """
    try:
        # Parse the data URL
        header, data = data_url.split(',', 1)
        
        # Validate header format
        if not header.startswith('data:image/'):
            raise ValueError(f"Invalid data URL format: {header}")
        
        # Extract mime type
        mime_type = header.split(';')[0].replace('data:', '')
        
        # Validate image mime type
        if not mime_type.startswith('image/'):
            raise ValueError(f"Invalid image mime type: {mime_type}")
        
        # Decode base64 data
        try:
            image_data = base64.b64decode(data)
        except Exception as e:
            raise ValueError(f"Invalid base64 encoding: {str(e)}")
        
        # Load image
        image = Image.open(io.BytesIO(image_data))
        
        # Validate image
        # _validate_image(image)
        
        logger.debug(f"Loaded base64 image: {mime_type}, size: {image.size}")
        return image
        
    except Exception as e:
        logger.error(f"Failed to load base64 image: {str(e)}")
        raise

def _load_image_from_url(url: str) -> Image.Image:
    """
    Load image from HTTP/HTTPS URL.
    
    Args:
        url: HTTP or HTTPS URL
        
    Returns:
        PIL Image object
    """
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not all([parsed_url.scheme, parsed_url.netloc]):
            raise ValueError(f"Invalid URL format: {url}")
        
        # Set up session with proper headers and timeouts
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'VILA-Server/1.0.0',
            'Accept': 'image/*',
        })
        
        # Download image with timeout and size limit
        logger.debug(f"Downloading image from: {url}")
        
        response = session.get(
            url,
            timeout=(10, 30),  # (connect_timeout, read_timeout)
            stream=True,
            allow_redirects=True
        )
        response.raise_for_status()
        
        # Check content type
        content_type = response.headers.get('content-type', '').lower()
        if content_type and not content_type.startswith('image/'):
            logger.warning(f"Unexpected content type: {content_type}")
        
        # Check content length (limit to 50MB)
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > 50 * 1024 * 1024:
            raise ValueError(f"Image too large: {content_length} bytes")
        
        # Read image data with size limit
        image_data = io.BytesIO()
        downloaded_size = 0
        max_size = 50 * 1024 * 1024  # 50MB limit
        
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                downloaded_size += len(chunk)
                if downloaded_size > max_size:
                    raise ValueError(f"Image too large: exceeded {max_size} bytes")
                image_data.write(chunk)
        
        image_data.seek(0)
        
        # Load image
        image = Image.open(image_data)
        
        # Validate image
        # _validate_image(image)
        
        logger.debug(f"Downloaded image: {url}, size: {image.size}, mode: {image.mode}")
        return image
        
    except requests.RequestException as e:
        logger.error(f"Failed to download image from {url}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Failed to load image from URL: {str(e)}")
        raise

def _load_image_from_file(file_path: str) -> Image.Image:
    """
    Load image from local file path.
    
    Args:
        file_path: Local file system path
        
    Returns:
        PIL Image object
    """
    try:
        path = Path(file_path)
        
        # Check if file exists
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {file_path}")
        
        # Check if it's a file (not directory)
        if not path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")
        
        # Check file size (limit to 50MB)
        file_size = path.stat().st_size
        if file_size > 50 * 1024 * 1024:
            raise ValueError(f"Image file too large: {file_size} bytes")
        
        # Validate file extension
        mime_type, _ = mimetypes.guess_type(str(path))
        if mime_type and not mime_type.startswith('image/'):
            logger.warning(f"Unexpected file type: {mime_type}")
        
        # Load image
        image = Image.open(path)
        
        # Validate image
        # _validate_image(image)
        
        logger.debug(f"Loaded local image: {file_path}, size: {image.size}, mode: {image.mode}")
        return image
        
    except Exception as e:
        logger.error(f"Failed to load image from file {file_path}: {str(e)}")
        raise

def _validate_image(image: Image.Image) -> None:
    """
    Validate loaded image.
    
    Args:
        image: PIL Image object to validate
        
    Raises:
        ValueError: If image is invalid
    """
    # Verify image was loaded successfully
    try:
        image.verify()
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image: {str(e)}")
    
    # Reload image after verify (verify() can only be called once)
    if hasattr(image, 'filename') and image.filename:
        image = Image.open(image.filename)
    
    # Check image dimensions
    width, height = image.size
    if width <= 0 or height <= 0:
        raise ValueError(f"Invalid image dimensions: {width}x{height}")
    
    # Check for reasonable size limits (adjust as needed)
    max_dimension = 10000  # 10k pixels
    if width > max_dimension or height > max_dimension:
        raise ValueError(f"Image too large: {width}x{height} (max: {max_dimension})")
    
    # Convert to RGB if necessary (for consistency)
    if image.mode not in ('RGB', 'RGBA', 'L'):
        try:
            image = image.convert('RGB')
        except Exception as e:
            raise ValueError(f"Cannot convert image to RGB: {str(e)}")
    
    logger.debug(f"Image validation passed: {image.size}, mode: {image.mode}")

# Optional: Add image preprocessing for your VILA model
def preprocess_image_for_vila(image: Image.Image) -> Image.Image:
    """
    Preprocess image for VILA model.
    
    Args:
        image: PIL Image object
        
    Returns:
        Preprocessed PIL Image object
    """
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize if too large (adjust based on your model requirements)
    max_size = 1024
    if max(image.size) > max_size:
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        logger.debug(f"Resized image to: {image.size}")
    
    return image
