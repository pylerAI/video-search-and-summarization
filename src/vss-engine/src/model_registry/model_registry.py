#!/usr/bin/env python3

import os
import yaml
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


@dataclass
class ModelConfig:
    """Configuration for a VLM model"""
    
    model_id: str
    model_type: str
    api_key_env: str
    endpoint: str
    deployment_name: str
    enabled: bool
    description: str = ""
    additional_headers: Optional[Dict[str, str]] = None
    
    def __post_init__(self):
        """Post initialization validation"""
        if self.additional_headers is None:
            self.additional_headers = {}
    
    @property
    def api_key(self) -> Optional[str]:
        """Get the API key from environment variable"""
        if self.api_key_env:
            return os.environ.get(self.api_key_env)
        return None
    
    def is_valid(self) -> bool:
        """Check if the model configuration is valid"""
        if not self.enabled:
            return False
            
        if not all([self.model_id, self.model_type, self.endpoint, self.deployment_name]):
            return False
            
        # Check if API key is available (if required)
        if self.api_key_env and not self.api_key:
            logger.warning(f"API key environment variable '{self.api_key_env}' not found for model '{self.model_id}'")
            return False
            
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "id": self.model_id,
            "type": self.model_type,
            "endpoint": self.endpoint,
            "deployment_name": self.deployment_name,
            "enabled": self.enabled,
            "description": self.description,
            "has_api_key": self.api_key is not None
        }


class ModelRegistry:
    """Registry for managing VLM models"""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the model registry
        
        Args:
            config_path: Path to the YAML configuration file
        """
        self._models: Dict[str, ModelConfig] = {}
        self._default_model: Optional[str] = None
        self._global_settings: Dict[str, Any] = {}
        self._default_parameters: Dict[str, Any] = {}
        
        if config_path is None:
            # Default config path relative to this file
            config_path = Path(__file__).parent.parent / "config" / "vlm_models.yaml"
        
        self._config_path = Path(config_path)
        self.load_config()
    
    def load_config(self) -> None:
        """Load model configurations from YAML file"""
        try:
            if not self._config_path.exists():
                logger.error(f"Model configuration file not found: {self._config_path}")
                return
            
            with open(self._config_path, 'r') as file:
                config = yaml.safe_load(file)
            
            if not config:
                logger.warning("Empty or invalid model configuration file")
                return
            
            # Load global settings
            self._global_settings = config.get('global_settings', {})
            self._default_parameters = config.get('default_parameters', {})
            self._default_model = config.get('default_model')
            
            # Load model configurations
            vlm_models = config.get('vlm_models', {})
            for model_id, model_config in vlm_models.items():
                try:
                    model = ModelConfig(
                        model_id=model_id,
                        model_type=model_config.get('type', ''),
                        api_key_env=model_config.get('api_key_env', ''),
                        endpoint=model_config.get('endpoint', ''),
                        deployment_name=model_config.get('deployment_name', ''),
                        enabled=model_config.get('enabled', False),
                        description=model_config.get('description', ''),
                        additional_headers=model_config.get('additional_headers', {})
                    )
                    self._models[model_id] = model
                    
                except Exception as e:
                    logger.error(f"Failed to load model configuration for '{model_id}': {e}")
            
            logger.info(f"Loaded {len(self._models)} model configurations from {self._config_path}")
            
        except Exception as e:
            logger.error(f"Failed to load model configuration: {e}")
    
    def reload_config(self) -> None:
        """Reload the configuration from file"""
        self._models.clear()
        self.load_config()
    
    def get_model_config(self, model_id: str) -> Optional[ModelConfig]:
        """
        Get model configuration by ID
        
        Args:
            model_id: The model identifier
            
        Returns:
            ModelConfig if found and valid, None otherwise
        """
        model = self._models.get(model_id)
        if model and model.is_valid():
            return model
        return None
    
    def get_default_model_config(self) -> Optional[ModelConfig]:
        """Get the default model configuration"""
        if self._default_model:
            return self.get_model_config(self._default_model)
        
        # If no default specified, return the first enabled model
        for model in self._models.values():
            if model.is_valid():
                return model
        
        return None
    
    def list_available_models(self) -> List[str]:
        """List all available (enabled and valid) model IDs"""
        return [
            model_id for model_id, model in self._models.items()
            if model.is_valid()
        ]
    
    def list_all_models(self) -> List[ModelConfig]:
        """List all model configurations (including disabled)"""
        return list(self._models.values())
    
    def get_enabled_models(self) -> Dict[str, ModelConfig]:
        """Get all enabled and valid model configurations"""
        return {
            model_id: model for model_id, model in self._models.items()
            if model.is_valid()
        }
    
    def is_model_available(self, model_id: str) -> bool:
        """Check if a model is available (enabled and valid)"""
        return self.get_model_config(model_id) is not None
    
    def validate_all_models(self) -> Dict[str, str]:
        """
        Validate all model configurations
        
        Returns:
            Dictionary of model_id -> error_message for invalid models
        """
        errors = {}
        for model_id, model in self._models.items():
            if model.enabled and not model.is_valid():
                if not model.api_key:
                    errors[model_id] = f"API key environment variable '{model.api_key_env}' not found"
                elif not model.endpoint:
                    errors[model_id] = "Missing endpoint"
                elif not model.deployment_name:
                    errors[model_id] = "Missing deployment name"
                else:
                    errors[model_id] = "Invalid configuration"
        
        return errors
    
    def get_global_settings(self) -> Dict[str, Any]:
        """Get global settings for all models"""
        return self._global_settings.copy()
    
    def get_default_parameters(self) -> Dict[str, Any]:
        """Get default parameters for model requests"""
        return self._default_parameters.copy()
    
    def get_model_info_for_api(self) -> List[Dict[str, Any]]:
        """
        Get model information formatted for API responses
        
        Returns:
            List of model dictionaries suitable for /models endpoint
        """
        models = []
        for model in self._models.values():
            if model.is_valid():
                model_info = model.to_dict()
                # Add additional API-specific fields
                model_info.update({
                    "object": "model",
                    "created": 0,  # Static value for compatibility
                    "owned_by": "external"
                })
                models.append(model_info)
        
        return models
    
    def __len__(self) -> int:
        """Return number of loaded models"""
        return len(self._models)
    
    def __contains__(self, model_id: str) -> bool:
        """Check if model_id exists in registry"""
        return model_id in self._models
    
    def __iter__(self):
        """Iterate over model IDs"""
        return iter(self._models.keys())


# Global model registry instance
_model_registry: Optional[ModelRegistry] = None


def get_model_registry() -> ModelRegistry:
    """Get the global model registry instance (singleton pattern)"""
    global _model_registry
    if _model_registry is None:
        _model_registry = ModelRegistry()
    return _model_registry


def reload_model_registry() -> None:
    """Reload the global model registry configuration"""
    global _model_registry
    if _model_registry:
        _model_registry.reload_config()
