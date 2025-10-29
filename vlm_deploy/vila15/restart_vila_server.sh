#!/bin/bash

# VSS VILA Server Restart Script
# Use this script to restart the VILA server after CUDA memory corruption

echo "🔄 VSS VILA Server Restart Process"
echo "=================================="

echo "1. 🛑 Finding and stopping current VILA server process..."
VILA_PID=$(ps aux | grep "python3.*server.py" | grep -v grep | awk '{print $2}')

if [ ! -z "$VILA_PID" ]; then
    echo "   Found VILA server process: $VILA_PID"
    echo "   Stopping gracefully..."
    kill -TERM $VILA_PID
    sleep 3
    
    # Check if still running
    if kill -0 $VILA_PID 2>/dev/null; then
        echo "   Force killing process..."
        kill -KILL $VILA_PID
    fi
    echo "   ✅ VILA server stopped"
else
    echo "   ℹ️  No running VILA server found"
fi

echo ""
echo "2. 🧹 Clearing GPU memory..."
nvidia-smi --gpu-reset -i 0 2>/dev/null || echo "   Note: GPU reset requires elevated privileges"

echo ""
echo "3. 🚀 Starting VILA server..."
echo "   Use one of these commands:"
echo ""
echo "   🔧 For debugging (with CUDA blocking):"
echo "   cd /workspace/vss/vlm_deploy/vila15/VILA/serving"
echo "   CUDA_LAUNCH_BLOCKING=1 python3 server.py"
echo ""
echo "   🏃 For normal operation:"
echo "   cd /workspace/vss/vlm_deploy/vila15/VILA/serving"
echo "   python3 server.py"
echo ""
echo "4. ✅ After restart, test with:"
echo "   cd /workspace/vss/vlm_deploy/vila15"
echo "   python3 test_simple_vila.py"
echo ""
echo "5. 🎭 Then run VSS simulation:"
echo "   python3 test_vss_engine_simulation.py"
echo ""
echo "💡 Remember: Use sequential processing to avoid GPU memory issues!"