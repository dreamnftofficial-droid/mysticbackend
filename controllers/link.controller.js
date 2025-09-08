import { Link } from "../models/links.model.js";


export const createLink = async (req, res) => {
    try {
        const { t_channelLink, t_helpLineLink,t_grouplink } = req.body;
        const link = new Link({
           t_channeklink: t_channelLink,
           t_helplinelink: t_helpLineLink,
           t_groupLink: t_grouplink     
        });
        await link.save();
        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllLinks = async (req, res) => {
    try {
        const links = await Link.find();
        if (!links || links.length === 0) {
            return res.status(404).json({ message: "No links found" });
        }
        res.status(200).json(links);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatelinks=async (req, res) => {

    try {
        const {id}=req.params
        const { t_channelLink, t_helpLineLink,t_groupLink } = req.body;
        const link = await Link.findByIdAndUpdate(id, { t_channeklink: t_channelLink,t_helplinelink: t_helpLineLink ,t_groupLink:t_groupLink}, { new: true });
        if (!link) {
            return res.status(404).json({ message: "Links not found" });
        }
        res.status(200).json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}