import moment from "moment-timezone";

export default {
  name: "age",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "Máy tính tuổi",
  role: "member",
  aliases: ["tinhtuoi"],
  execute: async ({ args }) => {
    const userInput = args[0];

    if (!userInput) {
      return kaguya.reply(`Vui lòng nhập theo định dạng chính xác.\nVí dụ: ${global.client.config.prefix}age 16-07-2005`);
    }

    const [ngaySinh, thangSinh, namSinh] = userInput.split("-").map(Number);

    if (!ngaySinh || isNaN(ngaySinh) || ngaySinh > 31 || ngaySinh < 1 || !thangSinh || isNaN(thangSinh) || thangSinh > 12 || thangSinh < 1 || !namSinh) {
      return kaguya.reply("Ngày, tháng hoặc năm sinh không hợp lệ!");
    }

    const [ngayHienTai, thangHienTai, namHienTai] = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY").split("/").map(Number);

    const soNamDaQua = namHienTai - namSinh;
    const soThangDaQua = thangHienTai - thangSinh + soNamDaQua * 12;
    const soNgayDaQua = ngayHienTai - ngaySinh + soThangDaQua * 30;

    return kaguya.reply(`Tuổi hiện tại: ${soNamDaQua} tuổi, đã qua: ${soThangDaQua} tháng, tổng số ngày: ${soNgayDaQua} ngày`);
  },
};
