export default {
    async fetch(request, env) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  // 允许的方法
            "Access-Control-Allow-Headers": "Content-Type, Authorization"  // 允许的头
          }
        });
      }
  
      const url = new URL(request.url);
  
      if (url.pathname === '/list-images') {
        return await listImages(env.MY_BUCKET);
      } else if (url.pathname === '/upload-image') {
        return await uploadImage(url, env.MY_BUCKET);
      }
  
      if (request.method !== "POST") {
        return new Response("Only POST requests are allowed", {
          status: 405,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
  
      const { prompt } = await request.json();
  
      if (!prompt) {
        return new Response("Missing 'prompt' parameter in the request body", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
  
      const REPLICATE_API_TOKEN = env.REPLICATE_API_TOKEN;
  
      const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          version: "7983ee50c079b41cfb8bcda6160b1b73788de6d75bf73f55d849990cb8a72494",
          input: {
            seed: 29830,
            model: "dev",
            prompt: prompt,
            lora_scale: 1,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            guidance_scale: 3.5,
            output_quality: 90,
            prompt_strength: 0.8,
            extra_lora_scale: 1,
            num_inference_steps: 28
          }
        })
      });
  
      const result = await replicateResponse.json();
  
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  }
  
  // 获取存储桶中的所有图片
  async function listImages(bucket) {
    const listed = await bucket.list({prefix: "images"});
      
    // 构建返回的图片列表数据
    const images = listed.objects.map(object => ({
      name: object.key,
      size: object.size,
      uploadedAt: object.uploaded,
      // 可以根据需要添加签名后的临时访问URL
      url: `https://psyqimg.uuo.app/${object.key}`,
    }));
  
    // 返回 JSON 格式的响应
    return new Response(JSON.stringify(images), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  
  // 上传图像到存储桶
  async function uploadImage(url, bucket) {
    // 从请求的 body 获取 img_url
    const img_url = url.searchParams.get('img_url');  // 从查询参数中获取 img_url
    const prompt = url.searchParams.get('prompt');  // 从查询参数中获取 img_url
  
    if (!img_url) {
      return new Response(JSON.stringify({ error: "img_url is required" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }    });
    }
  
    try {
      // 下载图片
      const response = await fetch(img_url);
      
      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch the image" }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }      });
      }
  
      // 获取图片的原始文件名（从 URL 中提取）
      const url = new URL(img_url);
      const originalFilename = url.pathname.split('/').pop(); // 获取 URL 路径的最后部分（即文件名）
      
      // 获取当前时间戳并附加到文件名
      const timestamp = Date.now();
      const extension = originalFilename.split('.').pop(); // 获取文件的扩展名
      const filename = `images/${originalFilename.replace(`.${extension}`, `_${prompt}_${timestamp}.${extension}`)}`; // 生成新的文件名
  
      const contentType = response.headers.get("Content-Type") || "application/octet-stream";
      const imageBuffer = await response.arrayBuffer(); // 获取图像的二进制数据
  
      // 上传到 R2 存储桶
      await bucket.put(filename, imageBuffer, {
        httpMetadata: { contentType }
      });
  
      return new Response(JSON.stringify({ message: "Image uploaded", key: filename }), {
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
  
    } catch (error) {
      return new Response(JSON.stringify({ error: "Error downloading or uploading image", details: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }    });
    }
  }
  