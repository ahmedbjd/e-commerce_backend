import supabase from "../config/supabase.js";


export const addProduct = async (req, res) => {
  try {
    const { name, description, type, price, quantity } = req.body;

    let image_url = null;

    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        return res.status(400).json({
          status: false,
          message: "Image upload failed",
          error: uploadError.message,
        });
      }

      const { data: publicUrl } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      image_url = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, type, price, quantity, image_url }])
      .select();

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Error in creating product",
        error: error.message,
      });
    }

    return res.status(201).json({
      status: true,
      message: "Product created successfully",
      product: data[0],
    });
  } catch (error) {
    console.error("Error in adding product:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .gt("quantity", 0) 
      .range(from, to);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Error fetching products",
        error,
      });
    }

    return res.status(200).json({
      status: true,
      page,
      total: count,
      totalPages: Math.ceil(count / limit),
      data,
    });
  } catch (error) {
    console.error("Error in listing products ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
        error,
      });
    }

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching product ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, price, quantity, image_url } = req.body;

    const { data, error } = await supabase
      .from("products")
      .update({ name, description, type, price, quantity, image_url })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Error updating product",
        error,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating product ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return res.status(400).json({
        status: false,
        message: "Error deleting product",
        error,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product ", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
};

export const updateProductQuantity = async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body; // new quantity value
  
      if (quantity === undefined) {
        return res.status(400).json({
          status: false,
          message: "Quantity is required",
        });
      }
  
      const { data, error } = await supabase
        .from("products")
        .update({ quantity })
        .eq("id", id)
        .select();
  
      if (error || !data.length) {
        return res.status(400).json({
          status: false,
          message: "Error updating quantity",
          error,
        });
      }
  
      return res.status(200).json({
        status: true,
        message: "Quantity updated successfully",
        product: data[0],
      });
    } catch (error) {
      console.error("Error updating quantity ", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  