import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 환경 변수 검증
const requiredEnvVars = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const envVarNameMap = {
  apiKey: 'REACT_APP_FIREBASE_API_KEY',
  authDomain: 'REACT_APP_AUTH_DOMAIN',
  projectId: 'REACT_APP_PROJECT_ID',
  storageBucket: 'REACT_APP_STORAGE_BUCKET',
  messagingSenderId: 'REACT_APP_MESSAGING_SENDER_ID',
  appId: 'REACT_APP_APP_ID'
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => envVarNameMap[key]);

if (missingVars.length > 0) {
  console.error('❌ Firebase 환경 변수가 설정되지 않았습니다:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 프로젝트 루트에 .env 파일을 생성하고 다음 내용을 추가하세요:');
  console.error('   REACT_APP_FIREBASE_API_KEY=your-api-key');
  console.error('   REACT_APP_AUTH_DOMAIN=your-auth-domain');
  console.error('   REACT_APP_PROJECT_ID=your-project-id');
  console.error('   REACT_APP_STORAGE_BUCKET=your-storage-bucket');
  console.error('   REACT_APP_MESSAGING_SENDER_ID=your-messaging-sender-id');
  console.error('   REACT_APP_APP_ID=your-app-id');
  console.error('\n⚠️  개발 서버를 재시작해야 환경 변수가 적용됩니다.');
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "AIzaSyDwZ8x5yY4VaoO2LfD5EWnBqqXZr6_yltE",
  authDomain: requiredEnvVars.authDomain || "oaksusu-7ed25.firebaseapp.com",
  projectId: requiredEnvVars.projectId || "oaksusu-7ed25",
  storageBucket: requiredEnvVars.storageBucket || "oaksusu-7ed25.firebasestorage.app",
  messagingSenderId: requiredEnvVars.messagingSenderId || "971240990566",
  appId: requiredEnvVars.appId || "1:971240990566:web:5ac36f8a546e89658ccaa7"
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error.message);
  console.error('💡 .env 파일을 확인하고 개발 서버를 재시작하세요.');
  app = null;
  auth = null;
}

export const db = getFirestore(app);

export { app };
export { auth };
