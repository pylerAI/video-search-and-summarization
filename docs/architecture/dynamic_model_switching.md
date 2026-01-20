# Dynamic Model Switching Architecture

## Overview

VSS supports **per-request model selection** - each API request can specify a different VLM model, and the system automatically switches between models without requiring service restarts.

## Architecture

### Components

#### 1. Model Registry (`model_registry.py`)
- Stores external model configurations (endpoint, API key, deployment name)
- Provides unified interface for model lookup
- Validates model availability

#### 2. VlmRequestParams (`vlm_pipeline.py`)
- Data class carrying model configuration per request
- Fields: `model_id`, `model_endpoint`, `model_api_key`, `model_deployment_name`, `model_additional_headers`
- Method: `has_model_config()` - validates configuration completeness

#### 3. ViaStreamHandler (`via_stream_handler.py`)
- Extracts model configuration from registry based on API request
- Populates `VlmRequestParams` with model-specific settings
- Passes configuration through the pipeline

#### 4. VlmProcess (`vlm_pipeline.py`)
- Worker process handling VLM inference
- Method: `_update_model_config_if_needed()` - core switching logic
- Maintains current model state per worker process

### Request Flow

```
API Request (model="gpt-4o")
    ↓
ViaStreamHandler
    → Model Registry Lookup
    → Populate VlmRequestParams
    ↓
VlmPipeline.enqueue_chunk(request_params)
    ↓
VlmProcess._process(request_params)
    → _update_model_config_if_needed()
    → Compare config to current state
    → Reinitialize CompOpenAIModel if changed
    ↓
Inference with selected model
```

## Key Implementation Details

### Smart Caching
Model configurations are compared before reinitialization:
- **Same model**: Early return, no reinitialization (optimization)
- **Different model**: CompOpenAIModel reinitialized with new config

### Multiprocessing Support
- Configuration flows through `VlmRequestParams` (serializable)
- Worker processes update independently
- No shared state between workers

### Error Handling
- Invalid configurations raise exceptions immediately
- Errors propagated through entire pipeline
- Failed model initialization returns error response to client

## Performance Characteristics

- **First request to model**: ~100-500ms (initialization + inference)
- **Subsequent requests (same model)**: ~50-200ms (inference only, no reinit)
- **Model switch**: ~100-500ms (reinitialization + inference)

## Code References

| Component | File | Key Methods |
|-----------|------|-------------|
| Request Params | `vlm_pipeline/vlm_pipeline.py` | `VlmRequestParams`, `has_model_config()` |
| Dynamic Switching | `vlm_pipeline/vlm_pipeline.py` | `VlmProcess._update_model_config_if_needed()` |
| Registry Integration | `via_stream_handler.py` | Lines 1240-1260 |
| Model Client | `models/openai_compat/openai_compat_model.py` | `CompOpenAIModel.__init__()` |

## Design Decisions

### Why Per-Request Configuration?
- Enables multi-tenant scenarios (different users, different models)
- No static configuration limits flexibility
- Worker processes can serve any model

### Why Compare Before Reinitializing?
- Most workloads use the same model repeatedly
- Avoids unnecessary client recreation
- Improves throughput for consistent model usage

### Why in Worker Process?
- Multiprocessing spawn mode doesn't share state changes
- Worker process has model instance
- Natural place for lifecycle management

## Future Enhancements

- Model pooling (multiple instances of popular models)
- Warmup on model registry changes
- Metrics for model switch frequency
