const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// 示例路由
app.get("/", (req, res) => {
  res.send("Hello from the data processing layer!");
});

// 示例处理请求的路由
app.post("/api/data", async (req, res) => {
  const requestData = req.body;

  // 这里可以处理数据并与后端 Go 服务进行交互
  try {
    // 使用 axios 向 Go 服务发送请求
    const response = await axios.post(
      "http://your-go-service-url/api/endpoint",
      requestData
    );

    // 返回响应给前端
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error processing data" });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
