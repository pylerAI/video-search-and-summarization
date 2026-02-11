# Deployment Package: dev-profile-compose

This deployment package contains the necessary components for deploying the application.

## Package Information

- **Package Name**: deploy-dev-profile-compose.tar.gz
- **Build Date**: 2026-02-09T04:46:31Z

## Contents

- `cleanup_all_datalog.sh` - Clean Up Scripts
- `NOTICE.md` - Notice
- `foundational/` - Foundational components
- `vst/` - Vst components
- `agents/` - Agents components
- `vlm-as-verifier/` - Vlm As Verifier components
- `rtvi/` - Rtvi components
- `lvs/` - Lvs components
- `nim/` - Nim components
- `developer-workflow/` - Dev Profile Compose components
- `dev-profile.sh` - Dep Profile Deploy Script
- `build.sh` - Build script for setting up the deployment
- `compose.yml` - Docker Compose configuration
- `MANIFEST` - Build metadata and version information

## Usage

1. Extract the tar.gz file:
   ```bash
   tar -xzf deploy-dev-profile-compose.tar.gz
   cd deployments
   ```

2. Run the build script:
   ```bash
   ./build.sh
   ```

3. Start the services using Docker Compose:
   ```bash
   export MODE=2d or 3d 
   export BP_PROFILE=bp_wh or bp_wh_vlm or bp_wh_vlm_a
   Update .env file with the appropriate values
   sudo docker compose -f compose.yml up -d --build --pull always --force-recreate
   ```

## Requirements

- Docker
- Docker Compose
- bash
- Nvidia Container toolkit version 1.17.8
- NVIDIA driver - 580.65.06 - DGX / 570.133.20 - all other platforms
- CUDA - 13.0 for NVIDIA driver - 580.65.06
- CUDA Version: 12.8 for  NVIDIA driver 570.133.20
## Support

For issues and questions, please refer to the main documentation.
