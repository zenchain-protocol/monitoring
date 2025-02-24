# 🚀 ZenChain Monitoring Functions  

This repository contains a set of **Vercel serverless functions** to monitor **ZenChain's** network health, checking for issues related to **block finality, speed, and stalls**.  

## 📌 Features  

- **Finality Check**: Detects if block finality is lagging beyond a defined threshold.  
- **Speed Check**: Measures block production speed over time.  
- **Stall Detection**: Checks if block production is delayed beyond an acceptable limit.  

## 🛠️ Installation  

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/zenchain-protocol/monitoring.git
   cd monitoring
   ```

2. **Install dependencies**:  
   ```bash
   npm install
   ```

3. **Set up environment variables**:  
   - Copy `.env.example` to `.env` and fill in your values:  
   ```ini
   BLOCK_FINALITY_LAG_THRESHOLD_IN_BLOCKS=100
   BLOCK_PRODUCTION_DELAY_THRESHOLD_IN_SECONDS=10
   BLOCK_SPEED_SECONDS_TO_WAIT_BEFORE_SECOND_REQUEST=5
   WSS_RPC_URL=wss://zenchain-testnet.api.onfinality.io/public-ws
   ```

## 🚀 Running Locally  

To test the functions locally using **Vercel**, install the **Vercel CLI** and run:  
```bash
npm install -g vercel
vercel dev
```
This will start a local server at `http://localhost:3000/api/{function}`.

## 📁 Project Structure  

```
.
├── api
│   └── block
│       ├── finality.ts  # Detects finality lag
│       ├── speed.ts     # Measures block production speed
│       └── stall.ts     # Detects block production stalls
├── .env.example         # Example environment variables
├── LICENSE              # MIT License
├── package.json         # Dependencies & scripts
└── README.md            # Project documentation
```

## 🔧 API Endpoints  

| Endpoint                | Description |
|-------------------------|-------------|
| `/api/block/finality`  | Checks block finality and alerts if lagging. |
| `/api/block/speed`     | Measures block production speed. |
| `/api/block/stall`     | Detects if block production is delayed. |

### 🏗️ API Response Format  

Each function returns a **JSON response** indicating the network health:  

**Success Example (`200 OK`)**  
```json
{
  "status": "ok",
  "message": "Finality is healthy",
  "finalizedBlock": 1000,
  "bestBlock": 1002,
  "lag": 2
}
```

**Error Example (`500 ERROR`)**  
```json
{
  "status": "error",
  "message": "Finality is stalled!",
  "finalizedBlock": 900,
  "bestBlock": 1002,
  "lag": 102
}
```

## 🎯 Deployment  

Deploy instantly with Vercel:  
```bash
vercel
```
or connect the repository to **Vercel Dashboard** for auto-deployment.

## 📜 License  

This project is licensed under the **MIT License**.
