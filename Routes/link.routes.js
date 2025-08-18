import {Router} from 'express'

import { createLink,getAllLinks,updatelinks } from '../controllers/link.controller.js'

const router = Router();    

// Route to create a new link

router.route('/create').post(createLink);
// Route to get all links
router.route('/all').get(getAllLinks);
// Route to update links by ID
router.route('/update/:id').put(updatelinks);

export default router;
