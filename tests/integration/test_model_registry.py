#!/usr/bin/env python3
"""
Simple test script for Phase 1: Model Registry Integration
This script tests the basic model registry functionality without starting the full VSS server.
"""

import os
import sys
import logging

# Add the src path to import our modules
sys.path.insert(0, '/workspace/video-search-and-summarization/src/vss-engine/src')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_model_registry():
    """Test basic model registry functionality"""
    try:
        # Import and initialize model registry
        from model_registry import get_model_registry
        
        logger.info("=== Testing Model Registry ===")
        
        # Initialize registry
        registry = get_model_registry()
        logger.info(f"Model registry initialized with {len(registry)} models")
        
        # List available models
        available_models = registry.list_available_models()
        logger.info(f"Available models: {available_models}")
        
        # Test default model
        default_model = registry.get_default_model_config()
        if default_model:
            logger.info(f"Default model: {default_model.model_id}")
        else:
            logger.warning("No default model configured")
        
        # Test model validation
        for model_id in available_models[:2]:  # Test first 2 models
            model_config = registry.get_model_config(model_id)
            if model_config:
                logger.info(f"Model {model_id}: endpoint={model_config.endpoint}, valid={model_config.is_valid()}")
            else:
                logger.error(f"Failed to get config for model: {model_id}")
        
        # Test API format
        api_models = registry.get_model_info_for_api()
        logger.info(f"API format models: {len(api_models)} models ready for /models endpoint")
        
        # Test validation errors
        validation_errors = registry.validate_all_models()
        if validation_errors:
            logger.warning(f"Model validation errors: {validation_errors}")
        else:
            logger.info("All enabled models passed validation")
            
        return True
        
    except Exception as e:
        logger.error(f"Model registry test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_environment_variables():
    """Test if required environment variables are set"""
    logger.info("=== Testing Environment Variables ===")
    
    # Check for common API keys that should be set for testing
    required_env_vars = [
        'OPENAI_GPT4O_API_KEY',
        'OPENAI_GPT4O_MINI_API_KEY', 
        'GOOGLE_GEMINI_API_KEY'
    ]
    
    for env_var in required_env_vars:
        value = os.environ.get(env_var)
        if value:
            logger.info(f"✓ {env_var} is set (length: {len(value)})")
        else:
            logger.warning(f"✗ {env_var} is not set")

def main():
    """Main test function"""
    logger.info("Starting Phase 1 Model Registry Tests")
    
    # Test environment variables
    test_environment_variables()
    
    # Test model registry
    success = test_model_registry()
    
    if success:
        logger.info("✅ Phase 1 tests completed successfully!")
        logger.info("Next steps:")
        logger.info("1. Set required environment variables for API keys")
        logger.info("2. Test /models endpoint by starting VSS server")
        logger.info("3. Test /summarize endpoint with model parameter")
    else:
        logger.error("❌ Phase 1 tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()