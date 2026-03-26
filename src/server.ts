import App from '@/app';
import validateEnv from '@utils/validateEnv';
import UserRoute from './routes/user.route';
import AuthRoute from './routes/auth.route';
import AdminRoute from "./routes/admin.route"
import SocialMediaRoute from "./routes/socialMedia.route"
import CronRoute from "./routes/cron.route"
import FamilyTreeRoute from "./routes/familyTree.route"
validateEnv();

const app = new App({
  apiRoutes: [new AuthRoute(),new UserRoute() , new AdminRoute(), new SocialMediaRoute(), new CronRoute(), new FamilyTreeRoute()],
  generalRoutes: [],
});

app.listen();
