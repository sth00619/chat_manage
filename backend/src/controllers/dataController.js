const Contact = require('../models/Contact');
const Credential = require('../models/Credential');
const Goal = require('../models/Goal');
const Schedule = require('../models/Schedule');
const NumericalInfo = require('../models/NumericalInfo');
const Album = require('../models/Album');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

class DataController {
  async getContacts(req, res) {
    try {
      const contacts = await Contact.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createContact(req, res) {
    try {
      const contact = await Contact.create({
        ...req.body,
        user_id: req.user.id
      });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateContact(req, res) {
    try {
      const { id } = req.params;
      const contact = await Contact.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      await contact.update(req.body);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteContact(req, res) {
    try {
      const { id } = req.params;
      const result = await Contact.destroy({
        where: { id, user_id: req.user.id }
      });
      
      if (result === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCredentials(req, res) {
    try {
      const credentials = await Credential.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCredential(req, res) {
    try {
      const credential = await Credential.create({
        ...req.body,
        user_id: req.user.id
      });
      res.json(credential);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCredential(req, res) {
    try {
      const { id } = req.params;
      const credential = await Credential.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }
      
      await credential.update(req.body);
      res.json(credential);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCredential(req, res) {
    try {
      const { id } = req.params;
      const result = await Credential.destroy({
        where: { id, user_id: req.user.id }
      });
      
      if (result === 0) {
        return res.status(404).json({ error: 'Credential not found' });
      }
      
      res.json({ message: 'Credential deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getGoals(req, res) {
    try {
      const goals = await Goal.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createGoal(req, res) {
    try {
      const goal = await Goal.create({
        ...req.body,
        user_id: req.user.id
      });
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateGoal(req, res) {
    try {
      const { id } = req.params;
      const goal = await Goal.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      await goal.update(req.body);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteGoal(req, res) {
    try {
      const { id } = req.params;
      const result = await Goal.destroy({
        where: { id, user_id: req.user.id }
      });
      
      if (result === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSchedules(req, res) {
    try {
      const { start, end } = req.query;
      const where = { user_id: req.user.id };
      
      if (start && end) {
        where.start_time = {
          [Op.between]: [new Date(start), new Date(end)]
        };
      }

      const schedules = await Schedule.findAll({
        where,
        order: [['start_time', 'ASC']]
      });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSchedule(req, res) {
    try {
      const schedule = await Schedule.create({
        ...req.body,
        user_id: req.user.id
      });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      await schedule.update(req.body);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const result = await Schedule.destroy({
        where: { id, user_id: req.user.id }
      });
      
      if (result === 0) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getNumericalInfo(req, res) {
    try {
      const info = await NumericalInfo.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNumericalInfo(req, res) {
    try {
      const info = await NumericalInfo.create({
        ...req.body,
        user_id: req.user.id
      });
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateNumericalInfo(req, res) {
    try {
      const { id } = req.params;
      const info = await NumericalInfo.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!info) {
        return res.status(404).json({ error: 'Numerical info not found' });
      }
      
      await info.update(req.body);
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteNumericalInfo(req, res) {
    try {
      const { id } = req.params;
      const result = await NumericalInfo.destroy({
        where: { id, user_id: req.user.id }
      });
      
      if (result === 0) {
        return res.status(404).json({ error: 'Numerical info not found' });
      }
      
      res.json({ message: 'Numerical info deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAlbums(req, res) {
    try {
      const albums = await Album.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });
      res.json(albums);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const album = await Album.create({
        user_id: req.user.id,
        filename: file.filename,
        original_name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      });
      res.json(album);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAlbum(req, res) {
    try {
      const { id } = req.params;
      const album = await Album.findOne({
        where: { id, user_id: req.user.id }
      });
      
      if (!album) {
        return res.status(404).json({ error: 'Album not found' });
      }
      
      // Delete file from filesystem
      const fs = require('fs');
      const filePath = path.join(__dirname, '../../uploads', album.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await album.destroy();
      res.json({ message: 'Album deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = { DataController: new DataController(), upload };