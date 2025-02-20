import { Request, Response, NextFunction } from "express";
import { getAddressByIdService } from "../services/address/getAdressById.service";
import { updateUserAddressService } from "../services/address/updateAdressUser.service";
import { createUserAddressService } from "../services/address/createAddressUser.service";
import { deleteUserAddressService } from "../services/address/deleteAddressUser.service";
import { getUserAddressesService } from "../services/address/getUserAdress.service";

export class AddressController {
  async getUserAddressController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await getUserAddressesService(req);

      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const result = await getAddressByIdService(Number(id));

      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }
  
  async getOutletAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getAllOutletsService();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUserAddressController(req: Request,res: Response,next: NextFunction  ) {
    try {
      const id = req.params.id;

      const result = await updateUserAddressService(Number(id), req.body);

      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async createUserAddressController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      createUserAddressService(req, res);
      return;
    } catch (error) {
      next(error);
    }
  }

  async deleteUserAddressController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;

      const result = await deleteUserAddressService(Number(id));

      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }
}
