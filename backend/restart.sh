#!/bin/bash
echo "🛑 Killing all hanging Python processes..."
pkill -9 -f uvicorn
pkill -9 -f "venv/bin/python"

echo "🧹 Clearing corrupted graph locks..."
rm -rf venv/lib/python3.13/site-packages/cognee/.cognee_system/databases/*

echo "🚀 Starting Kyro Backend..."
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
