import { RequestHandler } from 'express';
import { cleanObj, generalResponse } from '@/helper/common.helper';

interface JoiErrorDetail {
  message: string;
}

const errorFilterValidator = (errors: JoiErrorDetail[]) => {
  return errors.map(err => err.message).join(', ');
};

const validationMiddleware =
  (schema: any, value: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  async (req, res, next) => {
    try {
      const data = req[value] || {};

      cleanObj(data);

      const validatedData = await schema.validateAsync(data, {
        abortEarly: false,
      });

      // ❌ req[value] = validatedData;
      // ✅ mutate instead
      Object.keys(data).forEach(k => delete (data as any)[k]);
      Object.assign(data, validatedData);

      next();
    } catch (e: any) {
      if (e.details) {
        const errorResponse = errorFilterValidator(e.details);
        return generalResponse(res, null, errorResponse, 'error', true, 400);
      }

      console.log('e0', e);
      return generalResponse(res, null, 'Validation failed', 'error', true, 400);
    }
  };


export default validationMiddleware;
