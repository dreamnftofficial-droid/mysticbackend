import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import {NFT} from "../models/nft.model.js";
import cloudinary from '../middelwares/cloudinary.middelware.js'


export const createnft = asynchandler(async (req, res) => {

const {name}=req.body;
if(!name){
    throw new apierror("Please provide all the fields",400);
}
const file = req.file;
if (!file) {
    throw new apierror("Please upload a file", 400);
}
const result = await cloudinary.uploader.upload(file.path, {
    folder: "nft",
 
});
const nft =await NFT.create({
    name,
    picture: result.secure_url,
    pictureId: result.public_id
}) ;
res.status(201).json(
    {
        success: true,
        message: "NFT created successfully",
        data: nft
    }
);
}
);


export const getnfts = asynchandler(async (req, res) => {   
    
    // Assuming you have a model named Nft to interact with the database
    const nfts = await NFT.find({});
    res.status(200).json(
        {
            success: true,
            message: "NFTs fetched successfully",
            data: nfts
        } 
    );
}
);

export const getnft = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new apierror("Please provide an NFT ID", 400);
    }
    const nft = await NFT.findById(id);
    if (!nft) {
        throw new apierror("NFT not found", 404);
    }
    res.status(200).json(
       {
            success: true,
            message: "NFT fetched successfully",
            data: nft
        } 
    );
}
);

export const deletenft = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new apierror("Please provide an NFT ID", 400);
    }
    const nft = await NFT.findByIdAndDelete(id);
    if (!nft) {
        throw new apierror("NFT not found", 404);
    }
    res.status(200).json(
         {
            success: true,
            message: "NFT deleted successfully",
            data: nft
        } 
    );
});

export const updatenft = asynchandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new apierror("Please provide an NFT ID", 400);
    }
    const { name } = req.body;
    if (!name) {
        throw new apierror("Please provide a name for the NFT", 400);
    }
    const file = req.file;
    let picture, pictureId;
    let oldnft= await NFT.findById(id)
    if (file) {
        const deleted=await cloudinary.uploader.destroy(oldnft.pictureId)
        if (deleted) {
            const result = await cloudinary.uploader.upload(file.path, {
            folder: "nft",
        });
        picture = result.secure_url;
        pictureId = result.public_id;
        }
      
    }
    const nft = await NFT.findByIdAndUpdate(id, { name, picture, pictureId }, { new: true });
    if (!nft) {
        throw new apierror("NFT not found", 404);
    }
    res.status(200).json(
       {
            success: true,
            message: "NFT updated successfully",
            data: nft
        } )
}
);
