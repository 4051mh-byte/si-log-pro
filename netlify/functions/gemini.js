const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { reportText, mode } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    let modelName = 'gemini-1.5-flash';
    let systemRole = '';
    
    switch (mode) {
      case 'fast':
        modelName = 'gemini-1.5-flash';
        systemRole = "당신은 20년 경력의 소아 작업치료사입니다. 일지를 읽고 '활동 계획 및 결과'를 4~5줄로 요약하세요. 상황 묘사를 임상적 용어로 변환하고, 문장은 간결하되 인과관계가 명확해야 합니다. 감각통합 및 아동발달 이론에 근거하여 작성하세요.";
        break;
      case 'thinking':
        modelName = 'gemini-2.0-flash-thinking-exp-01-21';
        systemRole = "당신은 감각통합 슈퍼바이저입니다. 일지를 심층 분석하여 '활동 계획 및 결과'를 4~5줄로 요약하세요. 아동의 행동 이면에 있는 감각처리 문제를 추론하고, 전문 용어를 사용해 임상적으로 해석하세요. Ayres SI 이론과 발달 단계를 근거로 제시하세요.";
        break;
      case 'pro':
        modelName = 'gemini-1.5-pro';
        systemRole = "당신은 대학병원 작업치료사입니다. 일지를 읽고 '활동 계획 및 결과'를 4~5줄로 작성하되, 의무기록에 적합한 격식 있고 명확한 문장으로 작성하세요. 관찰된 사실에 근거하여 임상적 판단을 제시하고, 감각통합 및 아동발달 이론을 반영하세요.";
        break;
    }

    const prompt = `${systemRole}\n\n[입력된 치료 일지]\n${reportText}\n\n위 내용을 바탕으로 '활동 계획 및 결과'를 4~5줄로 요약해 주세요.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates[0].content) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          summary: data.candidates[0].content.parts[0].text
        })
      };
    } else {
      throw new Error('AI 응답을 해석할 수 없습니다.');
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || '서버 오류가 발생했습니다.'
      })
    };
  }
};
```

5. 하단 **"Commit changes"** 버튼 클릭

---

## 🚀 **이제 Netlify로 배포하기**

### **Step 1: Netlify 접속**

1. https://app.netlify.com 접속
2. GitHub 계정으로 로그인

### **Step 2: 사이트 추가**

1. **"Add new site"** 클릭
2. **"Import an existing project"** 선택
3. **"GitHub"** 클릭
4. 방금 만든 **"si-log-pro"** 저장소 선택

### **Step 3: 배포 설정**

화면에서 다음과 같이 설정:
```
Build command: (비워두기)
Publish directory: .
```

(점 하나만 입력)

**"Deploy si-log-pro"** 버튼 클릭!

---

## 🔑 **Step 4: API 키 설정 (매우 중요!)**

배포가 완료되면:

1. Netlify 대시보드에서 방금 배포한 사이트 클릭
2. 상단 **"Site configuration"** 클릭
3. 왼쪽 메뉴 **"Environment variables"** 클릭
4. **"Add a variable"** 클릭
5. 다음 입력:
```
   Key: GEMINI_API_KEY
   Value: (여기에 구글 Gemini API 키 붙여넣기)
