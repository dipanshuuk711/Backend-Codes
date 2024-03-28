const Joi = require('joi');

module.exports.listingSchema = Joi.object({
     listing: Joi.object({
          title: Joi.string().min(3).max(30).required(),
          description: Joi.string().min(5).max(100).required(),
          image: Joi.string().allow("", null),
          price: Joi.number().min(0).required(),
          location: Joi.string().required(),
          country: Joi.string().required(),
     }).required()
});