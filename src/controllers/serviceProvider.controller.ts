import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import ServiceProviderRepo from '@/repository/serviceProvider.repository';

export class ServiceProviderController {
  constructor(private readonly serviceProviderRepository: ServiceProviderRepo) {}

  readonly createServiceProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceProvider = await this.serviceProviderRepository.createServiceProvider(req);

      return generalResponse(
        res,
        {
          serviceProvider,
        },
        'Service Provider Created Successfully',
        'success',
        true,
      );
    } catch (error) {
      next(error);
    }
  };
}
