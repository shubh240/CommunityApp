import App from '@/app';
import validateEnv from '@utils/validateEnv';
import UserRoute from './routes/user.route';
import AuthRoute from './routes/auth.route';
import AdminRoute from "./routes/admin.route"
import SocialMediaRoute from "./routes/socialMedia.route"
import CronRoute from "./routes/cron.route"
import FamilyTreeRoute from "./routes/familyTree.route"
import MatrimonialRoute from "./routes/matrimonial.route"
import MessagingRoute from "./routes/messaging.route"
import NewsFeedRoute from "./routes/newsFeed.route"
import UploadRoute from "./routes/upload.route"
import { initializeSocket } from "./socket"
validateEnv();

const app = new App({
  apiRoutes: [new AuthRoute(),new UserRoute() , new AdminRoute(), new SocialMediaRoute(), new CronRoute(), new FamilyTreeRoute(), new MatrimonialRoute(), new MessagingRoute(), new NewsFeedRoute(), new UploadRoute()],
  generalRoutes: [],
});

// Initialize Socket.io on the HTTP server
const io = initializeSocket(app.httpServer);

app.listen();
