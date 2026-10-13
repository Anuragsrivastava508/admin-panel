const prisma = require("../config/db");

// GET /api/testimonials, /api/reviews
async function getTestimonials(req, res, next) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, testimonials, reviews: testimonials });
  } catch (error) {
    next(error);
  }
}

// POST /api/testimonials, /api/reviews
async function createTestimonial(req, res, next) {
  try {
    const { customerName, location, circuit, rating, content, vehicleUsed, featured, status } = req.body;

    if (!customerName || !content) {
      return res.status(400).json({ error: "Customer name and content are required" });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: customerName.trim(),
        location: location ? location.trim() : "",
        circuit: circuit ? circuit.trim() : "",
        rating: Number(rating) || 5,
        content: content.trim(),
        vehicleUsed: vehicleUsed ? vehicleUsed.trim() : null,
        featured: featured !== undefined ? Boolean(featured) : true,
        status: status || "APPROVED",
      },
    });

    return res.status(201).json({ success: true, testimonial, review: testimonial });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/testimonials/:id, /api/reviews/:id
async function updateTestimonial(req, res, next) {
  try {
    const { status, featured, rating, content } = req.body;

    const data = {};
    if (status !== undefined) data.status = status;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (rating !== undefined) data.rating = Number(rating);
    if (content !== undefined) data.content = content.trim();

    const updated = await prisma.testimonial.update({
      where: { id: req.params.id },
      data,
    });

    return res.status(200).json({ success: true, testimonial: updated, review: updated });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/testimonials/:id, /api/reviews/:id
async function deleteTestimonial(req, res, next) {
  try {
    await prisma.testimonial.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
