import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useProduct } from "../../../hooks/useProduct";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    categories,
    productTypes,
    prices,
    styles,
    suppliers,
    loading,
    error,
    fetchAllData,
    handleUpdateProduct,
    handleFetchProductById,
  } = useProduct();

  const [formData, setFormData] = useState({
    TenSanPham: "",
    DanhMucSanPham: { id: "", TenDanhMuc: "" },
    LoaiSanPham: { id: "", TenLoaiSanPham: "" },
    DonGia: { id: "", TenDonGia: "" },
    Style: { id: "", TenStyle: "", HinhAnh: "" },
    NhaCungCap: {
      idNhaCungCap: "",
      TenNhaCungCap: "",
      Email: "",
      SoDienThoai: "",
      DiaChi: "",
      MoTa: "",
    },
    GiaSanPham: "",
    SoLuong: null,
    MoTa: "",
    MauSac: [],
    TrangThai: "available",
    DanhGia: "",
    HinhAnh: [],
    YeuThich: false,
  });
  console.log(formData);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newColor, setNewColor] = useState({ MaMau: '', TenMau: '' });

  const [filteredProductTypes, setFilteredProductTypes] = useState([]);

  useEffect(() => {
    fetchAllData();
    loadProductData();
  }, [id]);

  useEffect(() => {
    if (formData.DanhMucSanPham?.id) {
      const filtered = productTypes.filter(
        type => type.DanhMucSanPham.id === formData.DanhMucSanPham.id
      );
      setFilteredProductTypes(filtered);
    }
  }, [formData.DanhMucSanPham?.id, productTypes]);

  const loadProductData = async () => {
    try {
      const response = await handleFetchProductById(id);
      if (response) {
        const productData = response.product || response;
        setFormData({
          TenSanPham: productData.TenSanPham || "",
          GiaSanPham: productData.GiaSanPham || "",
          SoLuong: productData.SoLuong || 0,
          MoTa: productData.MoTa || "",
          MauSac: productData.MauSac || [],
          TrangThai: productData.TrangThai || "available",
          DanhMucSanPham: productData.DanhMucSanPham || { id: "", TenDanhMuc: "" },
          LoaiSanPham: productData.LoaiSanPham || { id: "", TenLoaiSanPham: "" },
          DonGia: productData.DonGia || { id: "", TenDonGia: "" },
          Style: productData.Style || { id: "", TenStyle: "", HinhAnh: "" },
          NhaCungCap: productData.NhaCungCap || {
            idNhaCungCap: "",
            TenNhaCungCap: "",
            Email: "",
            SoDienThoai: "",
            DiaChi: "",
            MoTa: "",
          },
          YeuThich: productData.YeuThich || false,
        });

        if (productData.HinhAnh && productData.HinhAnh.length > 0) {
          const imageUrls = productData.HinhAnh.map(
            (img) => `http://localhost:8080${img}`
          );
          setExistingImages(productData.HinhAnh);
          setPreviewUrls(imageUrls);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5 - existingImages.length;
    const selectedFiles = files.slice(0, maxFiles);
    setSelectedFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    // Create preview URLs for new files
    const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...newUrls]);
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      const adjustedIndex = index - existingImages.length;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== adjustedIndex));
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        HinhAnh: [...existingImages],
      };

      if (selectedFiles.length > 0) {
        productData.newImages = selectedFiles;
      }
       console.log("productData",productData);
      const success = await handleUpdateProduct(id, productData);

      if (success) {
        previewUrls.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        alert("Cập nhật sản phẩm thành công!");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Có lỗi xảy ra khi cập nhật sản phẩm!");
    }
  };
  const handleAddColor = () => {
    if (newColor.MaMau && newColor.TenMau) {
      setFormData({
        ...formData,
        MauSac: [...formData.MauSac, newColor]
      });
      // setNewColor({ MaMau: '', TenMau: '' }); 
    }
  };
  
  const handleRemoveColor = (index) => {
    setFormData({
      ...formData,
      MauSac: formData.MauSac.filter((_, i) => i !== index)
    });
  };
  return (
    <>
      <Box
        sx={{
          p: 2,
          bgcolor: "#fff",
          borderRadius: "4px 4px 0 0",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon />
          <Typography variant="h5">Chỉnh sửa sản phẩm {id}</Typography>
        </Box>
      </Box>

      <Paper sx={{ mt: 2, p: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>Đang tải dữ liệu...</Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 3, color: "error.main" }}>
            {error}
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(2, 1fr)",
              }}
            >
              <TextField
                label="Tên sản phẩm"
                value={formData.TenSanPham}
                onChange={(e) =>
                  setFormData({ ...formData, TenSanPham: e.target.value })
                }
                required
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Danh mục sản phẩm</InputLabel>
                <Select
                  value={formData.DanhMucSanPham?.id || ""}
                  onChange={(e) => {
                    const selectedCategory = categories?.find(
                      (cat) => cat.id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      DanhMucSanPham: selectedCategory,
                      LoaiSanPham: { id: "", TenLoaiSanPham: "" }
                    });
                  }}
                >
                  {categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.TenDanhMuc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Loại sản phẩm</InputLabel>
                <Select
                  value={formData.LoaiSanPham?.id || ""}
                  onChange={(e) => {
                    const selectedType = filteredProductTypes.find(
                      (type) => type.id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      LoaiSanPham: selectedType || { id: "", TenLoaiSanPham: "" }
                    });
                  }}
                  disabled={!formData.DanhMucSanPham?.id}
                >
                  {filteredProductTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.TenLoaiSanPham}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Đơn giá</InputLabel>
                <Select
                  value={formData.DonGia?.id || ""}
                  onChange={(e) => {
                    const selectedPrice = prices.find(
                      (price) => price.id === e.target.value
                    );
                    setFormData({ ...formData, DonGia: selectedPrice });
                  }}
                >
                  {prices.map((price) => (
                    <MenuItem key={price.id} value={price.id}>
                      {price.TenDonGia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Style</InputLabel>
                <Select
                  value={formData.Style?.id || ""}
                  onChange={(e) => {
                    const selectedStyle = styles.find(
                      (style) => style.id === e.target.value
                    );
                    setFormData({ ...formData, Style: selectedStyle });
                  }}
                >
                  {styles.map((style) => (
                    <MenuItem key={style.id} value={style.id}>
                      {style.TenStyle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Nhà cung cấp</InputLabel>
                <Select
                  value={formData.NhaCungCap?.idNhaCungCap || ""}
                  onChange={(e) => {
                    const selectedSupplier = suppliers.find(
                      (sup) => sup.idNhaCungCap === e.target.value
                    );
                    setFormData({ ...formData, NhaCungCap: selectedSupplier });
                  }}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem
                      key={supplier.idNhaCungCap}
                      value={supplier.idNhaCungCap}
                    >
                      {supplier.TenNhaCungCap}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Giá sản phẩm"
                type="number"
                value={formData.GiaSanPham}
                onChange={(e) =>
                  setFormData({ ...formData, GiaSanPham: e.target.value })
                }
                required
                fullWidth
              />

              <TextField
                label="Số lượng"
                type="number"
                value={formData.SoLuong}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setFormData({ ...formData, SoLuong: e.target.value })
                }
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.TrangThai}
                  onChange={(e) =>
                    setFormData({ ...formData, TrangThai: e.target.value })
                  }
                >
                  <MenuItem value="available">Đang bán</MenuItem>
                  <MenuItem value="outOfStock">Hết hàng</MenuItem>
                  <MenuItem value="discontinued">Ngừng kinh doanh</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ gridColumn: "span 2" }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Màu sắc:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    bgcolor: "#fafafa",
                  }}
                >
                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
                      <TextField
                        size="small"
                        type="color"
                        label="Mã màu"
                        value={newColor.MaMau}
                        onChange={(e) =>
                          setNewColor({ ...newColor, MaMau: e.target.value })
                        }
                        sx={{ width: "120px" }}
                      />
                      <TextField
                        size="small"
                        label="Tên màu"
                        value={newColor.TenMau}
                        onChange={(e) =>
                          setNewColor({ ...newColor, TenMau: e.target.value })
                        }
                        sx={{ flex: 1 }}
                        placeholder="Ví dụ: Đỏ, Xanh, Vàng..."
                      />
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleAddColor}
                      disabled={!newColor.MaMau || !newColor.TenMau}
                      size="medium"
                      sx={{ minWidth: "100px" }}
                    >
                      Thêm màu
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      minHeight: "50px",
                      p: formData.MauSac.length > 0 ? 2 : 0,
                      bgcolor:
                        formData.MauSac.length > 0 ? "#fff" : "transparent",
                      borderRadius: 1,
                      border:
                        formData.MauSac.length > 0
                          ? "1px dashed #e0e0e0"
                          : "none",
                    }}
                  >
                    {formData.MauSac.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          p: 1,
                          pr: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: color.MaMau,
                            borderRadius: "50%",
                            border: "1px solid #ddd",
                          }}
                        />
                        <Typography variant="body2" sx={{ mx: 1 }}>
                          {color.TenMau}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveColor(index)}
                          sx={{
                            "&:hover": {
                              color: "error.main",
                              bgcolor: "error.lighter",
                            },
                          }}
                        >
                          <CloseOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            <TextField
              label="Mô tả"
              multiline
              rows={4}
              value={formData.MoTa}
              onChange={(e) =>
                setFormData({ ...formData, MoTa: e.target.value })
              }
              fullWidth
              sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Hình ảnh sản phẩm
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {previewUrls.map((url, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 100,
                      height: 100,
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleRemoveImage(index, index < existingImages.length)
                      }
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "background.paper" },
                      }}
                    >
                      <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {existingImages.length + selectedFiles.length < 5 && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadOutlinedIcon />}
                    sx={{
                      width: 100,
                      height: 100,
                      borderStyle: "dashed",
                    }}
                  >
                    Thêm ảnh
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/admin/products")}
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Lưu thay đổi
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </>
  );
};

export default EditProduct;
