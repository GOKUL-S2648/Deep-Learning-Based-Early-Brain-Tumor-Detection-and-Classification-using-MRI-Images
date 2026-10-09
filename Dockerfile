# We use a base image that has both Node.js and Python installed
FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

WORKDIR /app

# Install system dependencies that might be required by Pillow or PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package files and install Node.js dependencies
COPY backend/package.json backend/
RUN cd backend && npm install

# Install Python dependencies for the PyTorch CNN script
# We specifically install the CPU-only version of PyTorch to drastically reduce image size and memory usage for cloud deployment
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir Pillow

# Copy the backend code and the dataset folder (which contains predict.py and the model checkpoints)
COPY backend/ backend/
COPY dataset/ dataset/

# Set the working directory to where the Node server runs
WORKDIR /app/backend

# Expose the port the backend runs on (usually 3000 or whatever process.env.PORT is)
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
