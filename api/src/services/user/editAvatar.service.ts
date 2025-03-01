import { Request, Response } from "express";
import prisma from "../../prisma";
import { cloudinaryUpload } from "../../utils/cloudinary";

export const editAvatarService = async (req: Request, res: Response) => {
  console.log("Received file:", req.file);
    try {
        if (!req.file) throw { message: "Avatar not found !" };
        const { secure_url} = await cloudinaryUpload(req.file, "avatarLogin");
        await prisma.user.update({
          where: { id: req.user?.id },
          data: { avatar: secure_url },
        });
        res.status(200).send({ message: "Avatar edited !" });
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      }
    }