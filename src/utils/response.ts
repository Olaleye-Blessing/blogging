import { type Response } from "express";

export const sendResponse = <Data>({
	data,
	res,
  status = 200,
}: {
	data: Data;
	res: Response;
  status?: number;
}) => {
	res.status(status).json({
    status: "success",
    data
  })
};
