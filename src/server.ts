import App from '@/app';
import validateEnv from '@utils/validateEnv';
import UserRoute from './routes/user.route';
import AuthRoute from './routes/auth.route';
import AdminRoute from "./routes/admin.route"
validateEnv();

const app = new App({
  apiRoutes: [new AuthRoute(),new UserRoute() , new AdminRoute()],
  generalRoutes: [],
});

app.listen();
