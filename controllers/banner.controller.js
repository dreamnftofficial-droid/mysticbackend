import { Banner } from "../models/banner.model.js";
import cloudinary from "../middelwares/cloudinary.middelware.js";
import { asynchandler } from "../utils/asynchandler.js";


export const createBanner = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const banner = new Banner({
            image: result.secure_url,
            imageid:result.public_id
        });
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBanners = asynchandler(async (req, res) => {
    try {

        const banners=await Banner.find();
        if (!banners || banners.length === 0) {
            return res.status(404).json({ message: "No banners found" });
        }
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export const deletebanner=asynchandler(async(req,res)=>{
try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    await cloudinary.uploader.destroy(banner.imageid)
    if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner deleted successfully" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
})