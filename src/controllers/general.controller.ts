import type { NextFunction, Request, Response } from 'express';
import { generalResponse } from '@/helper/common.helper';
import GeneralRepo from '@/repository/general.repository';

export class GeneralController {
  constructor(private readonly generalRepository: GeneralRepo) {}

  readonly getStateList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const states = await this.generalRepository.getStateList(req);
      return generalResponse(res, states, '', 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly getDistrictList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const districts = await this.generalRepository.getDistrictList(req);
      return generalResponse(res, districts, '', 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly getBlockList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blocks = await this.generalRepository.getBlockList(req);
      return generalResponse(res, blocks, '', 'success', false);
    } catch (error) {
      next(error);
    }
  };

  readonly checkVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.generalRepository.checkVersion(req);
      return generalResponse(res, result, '', 'success', false);
    } catch (error) {
      next(error);
    }
  };
}
