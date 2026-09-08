# Handoff tam thoi

## Cap nhat moi nhat (calculator: lam tron, thoi gian ky thuat va giao dien)

### Muc tieu

- Lam tron Khau hao may va Du phong rui ro ve boi so `500d` gan nhat, de tranh gia tri le nhu `13.238d`.
- Hoan thien form tinh gia theo cac anh mau: bo cuc nhom truong, chi tiet gia von, nhieu vat lieu, nut va mau o nhap.
- Cho phep nhap ca gio va phut cho Thoi gian xu ly ky thuat.

### Da thuc hien

- `src/utils/currency.ts`:
  - Them `roundToNearest500(value)`, dung `Math.round` de lam tron ve bac `500d` gan nhat.
- `src/utils/calculator.ts`:
  - Khau hao may va Du phong rui ro cua ca lo dung `roundToNearest500`.
  - Dien, gia von moi san pham va gia ban de xuat van dung `roundUpTo500`.
- `src/components/calculator/SummaryCard.tsx`:
  - Phan tren hien Gia von / san pham va Gia ban de xuat / san pham.
  - Chi tiet gia von hien tong vat lieu va tung dong vat lieu (ten, mau, khoi luong, chi phi / san pham).
  - Phan cuoi hien tong Gia von ca khay, Loi nhuan va Gia ban ca khay.
  - Cap nhat tooltip Khau hao may va Du phong rui ro theo y nghia tinh theo ca lo va lam tron moi.
- `src/components/calculator/Calculator.tsx` va `src/pages/CalculatorPage.tsx`:
  - Bo cuc form chia thanh May in, Thong so in, Nhua va Chi phi khac; co o chon file G-code giao dien (chua doc/parsing file).
  - Bo nut Dat lai trung trong form; chi giu nut Dat lai canh nut Tinh toan.
  - Thoi gian xu ly ky thuat co ca gio va phut. Phut duoc luu trong `technicalMinutes` va quy doi truoc khi tinh:

    `technicalDuration = technicalHours + technicalMinutes / 60`.
- `src/utils/calculatorForm.ts`:
  - Them `technicalMinutes`, mac dinh `0`, va validate so nguyen trong khoang `0..59`.
- `src/index.css`:
  - Trang Calculator dung cung chieu rong ngoai voi trang Nhua/May in.
  - O nhap va o chon hien nen trang, vien xanh; hover/focus dung xanh dam hon.
  - Them style cho time input, file G-code, dong chi tiet vat lieu va tooltip thong tin.

### Trang thai hien tai

- `npm run build`: pass sau cap nhat gan nhat.
- Khong co test framework trong project.
- Chua co xu ly noi dung file G-code; o chon file hien chi la UI.

## Cap nhat moi nhat (hien thi du phong va cong thuc chi phi)

### Muc tieu

- Hien thi dung ty le `Du phong in hong (%)` ma nguoi dung nhap, khong suy dien lai tu chi phi da lam tron.
- Them bieu tuong thong tin nho canh tung dong chi phi de xem cong thuc tinh.

### Da thuc hien

- `src/utils/calculator.ts`:
  - Them `riskPercent` vao `CalculatorResult`, la ty le du phong da duoc chuan hoa va ap dung khi tinh.
  - Van giu quy tac lam tron len boi so `500d` cho chi phi du phong cua ca lo.
- `src/components/calculator/SummaryCard.tsx`:
  - Dong `Du phong in hong` hien dung phan tram da nhap, vi du nhap `15` hien `(15%)`; khong con tinh lai tu chi phi sau lam tron (co the hien sai thanh `16%`).
  - Them nut tron `i` canh cac dong Nhua, Dien, Khau hao may, Tien cong ky thuat, Chi phi khac va Du phong in hong.
  - Tooltip hien khi hover hoac focus bang ban phim, mo ta cong thuc, cach tinh theo lo, chia theo so luong va buoc lam tron neu co.
- `src/index.css`:
  - Them style cho nut thong tin va tooltip, ho tro `:focus-visible` de dung bang ban phim.

### Luu y

- Hai ty le lien nhau, vi du `12%` va `13%`, van co the cho cung mot muc chi phi du phong khi ket qua deu bi lam tron len cung bac `500d`. Day la quy tac lam tron, khong phai loi cap nhat gia tri.
- `npm run build`: pass sau cac cap nhat tren.

## Cap nhat moi nhat (cong thuc theo lo + trang Cai dat)

### Muc tieu

- Dong bo cach tinh gia voi Inkiri: trong luong nhua, thoi gian in va thoi gian xu ly ky thuat la gia tri cho ca lo/khay, sau do moi phan bo theo so luong san pham.
- Lam tron chi phi dung theo ket qua mau Inkiri de bo so lieu `250g`, `16 gio`, may Bambu Lab A1, du phong `15%`, markup `50%` tra ve gia von `90.500d` va gia ban `136.000d`.
- Them trang Cai dat de luu cac gia tri mac dinh phuc vu tinh gia.

### Da thuc hien

- `src/utils/calculator.ts`:
  - Doi cong thuc sang tinh chi phi theo ca lo truoc, sau do chia cho `quantity`.
  - Chi phi nhua, dien, khau hao, cong ky thuat va chi phi khac deu la chi phi lo.
  - Lam tron len boi so `500d` cho chi phi dien, khau hao va du phong in hong truoc khi tinh tong.
  - Gia von/san pham va gia ban de xuat tiep tuc duoc lam tron len boi so `500d`.
  - Ho tro ca `markup` (lai tren gia von) va `margin` (lai tren gia ban).
- `src/pages/CalculatorPage.tsx`:
  - Thoi gian in duoc tinh bang gio + phut/60.
  - Form Tinh gia tu dien may mac dinh, gia dien, luong gio, du phong va ty le loi nhuan tu Cai dat khi khoi tao hoac Dat lai.
- `src/utils/calculatorForm.ts` va `src/components/calculator/Calculator.tsx`:
  - Da co o nhap phut, gioi han phut tu `0` den `59`.
  - `formatNumberInput` trong `src/utils/currency.ts` xu ly an toan gia tri `undefined` de tranh loi trong Vite HMR.
- `src/types/index.ts`:
  - Them `CalculatorSettings` va `ProfitMethod`.
- `src/context/DataContext.tsx`:
  - Them `settings` va `updateSettings`.
  - Luu cai dat vao localStorage voi key `p3d.calculator-settings`.
  - Gia tri mac dinh: Bambu Lab A1, gia dien `4.000d/kWh`, luong gio `10.000d`, 200 san pham/thang, du phong `15%`, markup `50%`.
- `src/pages/SettingsPage.tsx`: trang Cai dat moi, co cac truong:
  - May mac dinh.
  - Gia dien, luong gio, so san pham ban/thang.
  - Bat/tat chi phi nang cao.
  - Du phong in hong, cach tinh loi nhuan va ty le loi nhuan.
- `src/App.tsx`, `src/components/layout/NavTabs.tsx`, `src/components/common/Icons.tsx`, `src/index.css`:
  - Them route `/settings`, tab Cai dat, SettingsIcon va style responsive cho trang.

### Cong thuc doi chieu Inkiri

Voi nhua `30.000d`, dien `5.320d`, khau hao `42.360d`, du phong `15%`, markup `50%`:

1. Dien: `5.320d` lam tron len thanh `6.000d`.
2. Khau hao: `42.360d` lam tron len thanh `42.500d`.
3. Tam tinh: `30.000 + 6.000 + 42.500 = 78.500d`.
4. Du phong: `78.500 x 15% = 11.775d`, lam tron len thanh `12.000d`.
5. Gia von: `78.500 + 12.000 = 90.500d`.
6. Gia ban: `90.500 x 1,5 = 135.750d`, lam tron len thanh `136.000d`.

### Trang thai hien tai

- `npm run build`: pass sau khi them trang Cai dat va cap nhat cong thuc.
- Khong co test framework trong project.
- Can kiem tra neu phat trien tiep: nhan dien va sua nhan giao dien con ghi `/ 1 san pham`; ngu nghia hien tai cua trong luong, thoi gian in va thoi gian xu ly ky thuat la cho ca lo/khay.
- Luu y: `monthlySalesQuantity` va `advancedCostsEnabled` da duoc luu/chinh sua tren trang Cai dat, nhung hien chua tham gia truc tiep vao cong thuc gia co ban. Cac gia tri con lai da cap mac dinh cho form tinh gia.

## Cap nhat moi nhat (nhua va calculator da nhieu vat lieu)

### Muc tieu

- Don gian hoa thu vien nhua thanh form nhap truc tiep, co goi y ten nhua va mau.
- Ho tro gia tri so nhap co dau phay phan tach hang nghin, vi du `120,000` va `1,200,000`.
- Cho phep chon hoac tu nhap Loai nhua, dong thoi goi y cac loai co san.
- Calculator cho phep them nhieu loai nhua cho mot san pham; moi dong co nhua, khoi luong gram va co the xoa.

### Da thuc hien

- `src/components/common/FormattedNumberInput.tsx`: them input so dung chung. Gia tri hien thi co dau phay tach hang nghin trong khi van luu duoi dang chuoi de nhap lieu on dinh.
- `src/utils/currency.ts`: `formatNumberInput` va `parseNumberInput` xu ly dau phay la ky tu tach hang nghin; dau cham dung cho phan thap phan.
- `src/components/materials/PlasticForm.tsx`:
  - Form nhua toi gian chi con Ten, Loai, Gia/kg va Mau.
  - Ten nhua dung dropdown tuy chinh co tim kiem, gioi han chieu cao va thanh cuon doc (khong dung `datalist` do trinh duyet khong cho kiem soat kich thuoc).
  - Them preset Bambu Lab PETG Basic va PLA Basic/PLA Silk theo mau; khi chon tu dong dat Ten, Loai va mau, khong tu dien Gia/kg.
  - Loai nhua la input ket hop dropdown goi y (`PLA`, `PETG`, `ABS`, `ASA`, `TPU`, `PC`, `PA`, `PVA`), nguoi dung co the tu nhap loai moi.
- `src/pages/MaterialsPage.tsx` va `src/components/materials/PlasticTable.tsx`: thu vien nhua dung form inline va danh sach rut gon; bo modal, tim kiem, loc, sap xep, phan trang va chi tiet.
- `src/utils/calculatorForm.ts`:
  - Doi `plasticId` va `weight` don le thanh `materials: MaterialLineFormState[]`.
  - Moi dong vat lieu bat buoc co nhua va khoi luong lon hon 0.
- `src/components/calculator/Calculator.tsx`:
  - Phan Nhua cho phep them/xoa dong nhua, chon nhua va nhap gram theo tung dong.
  - O chon Loai nhua co chieu rong toi thieu 270px va khung Nhua rong toi da 28rem tren desktop de hien thi tron ten nhua dai; o Gram giu gon.
- `src/pages/CalculatorPage.tsx`: tong khoi luong duoc cong tu tat ca dong; chi phi tung nhua duoc tinh rieng truoc khi gui vao calculator.
- `src/utils/calculator.ts`: `CalculatorInput` nhan `plasticCosts`; chi phi nhua bang tong cac chi phi dong:

  `Chi phi nhua = tong(Khoi luong_i (g) x Gia_i (d/kg) / 1000)`.

### Trang thai hien tai

- `npm run build`: pass sau lan cap nhat nhieu vat lieu va bo cuc o chon nhua.
- Khong co test framework trong project.
- Lint truoc do chi co 2 warning `react(only-export-components)` tai `DataContext.tsx` va `ToastContext.tsx`.
- `sampleData.ts` van can giu: no cap du lieu mac dinh cho localStorage va preset cho form nhua/may in.

## Cap nhat moi nhat (may in - giao dien don gian + auto-fill)

### Muc tieu

Don gian hoa phan "may in" theo yeu cau + anh chup man hinh nguoi dung cung cap:

- Bo han cac truong model/nha san xuat/kich thuoc vung in/mo ta/trang thai khoi `Printer`, chi giu ten, cong suat (kW), gia mua, tuoi tho.
- Luu cong suat truc tiep bang kW (khong con Watt).
- Chon ten may khop voi may co san trong `sampleData.ts` (vd Bambu Lab A1, P1S) se tu dien cong suat + tuoi tho. Gia mua LUON de trong, khong auto-fill (moi nguoi mua gia khac nhau).
- Trang quan ly may in doi thanh list don gian (ten + cong suat/gia mua/tuoi tho + nut Sua/Xoa), bo tim kiem/loc/sort/phan trang/modal chi tiet. Form them/sua hien thuong truc o dau trang (khong con mo modal).
- Bo dieu kien loc "chi may active" trong dropdown chon may in cua Calculator (vi truong `status` da bi xoa khoi `Printer`).

### Da thuc hien

- `src/types/index.ts`: `Printer` chi con `id, name, powerKw, purchasePrice, lifetimeHours, createdAt`.
- `src/utils/calculator.ts`: `CalculatorInput.powerKw` (doi ten tu `powerWatt`); cong thuc dien = `powerKw * printHours * electricityPricePerKwh` (KHONG con chia 1000).
- `src/context/DataContext.tsx`: `isValidPrinter` kiem tra `powerKw` (thay `powerWatt`).
- `src/data/sampleData.ts`: `initialPrinters` rut gon theo schema moi, dung lam nguon preset cho typeahead (Bambu Lab A1 = 0.095 kW/4000h, P1S = 0.09 kW/5000h, Ender 3 V3, Saturn 3).
- `src/components/printers/PrinterForm.tsx`: viet lai hoan toan — 4 truong (ten may voi `datalist` preset, cong suat kW, tuoi tho gio, gia mua), auto-fill cong suat/tuoi tho khi ten khop preset, gia mua khong bao gio auto-fill. Form dung `grid` (khong con `flex flex-col`) de tranh ke thua `flex-basis: 10rem` tu class `.field` (class nay dung chung voi `.field-row`, gay khoang trang lon khi dat truc tiep trong container flex-column).
- `src/components/printers/PrinterTable.tsx`: viet lai thanh list don gian (`<ul className="item-list">`), bo `PrinterSortKey` va cac cot/sort/expand cu.
- `src/pages/PrintersPage.tsx`: viet lai — header "Thu vien may in" + link "Huong dan", form hien thuong truc (khong Modal), bo SearchBar/filter/sort/Pagination/modal chi tiet, giu `ConfirmDialog` cho xoa.
- `src/components/calculator/Calculator.tsx`: bo `.filter(p => p.status === "active")`, doi ten `activePrinters` -> `availablePrinters`; khoi hien thi may in chon: chi con Cong suat (kW)/Gia mua/Tuoi tho (bo Vung in).
- `src/pages/CalculatorPage.tsx`: doi `powerWatt` -> `powerKw` khi goi `calculatePrintCost`.

### Trang thai hien tai

Da hoan tat toan bo. `npm run build` va `npm run lint` deu pass (lint chi con 2 warning `react(only-export-components)` cu, khong lien quan). Da test tren browser: chon "Bambu Lab A1" va "Bambu Lab P1S" trong o Ten may auto-fill dung Cong suat/Tuoi tho, Gia mua may khong bi dien. Da fix mot khoang trang lon giua o Ten may va cac o ben duoi (nguyen nhan: `.field` co `flex: 1 1 10rem` bi hieu thanh chieu cao co dinh khi nam truc tiep trong form flex-column; sua bang cach doi form sang `grid`).

Truong `manufacturer`/`model`/`buildVolume*`/`description`/`status` van con o `Plastic` (khong lien quan, khong bi dong tren lan cap nhat nay).

## Cap nhat truoc do (cong thuc calculator model moi)

### Muc tieu

Cap nhat calculator tinh gia in 3D theo model moi:

- Khau hao may = `(gia mua may / tuoi tho theo gio) * thoi gian in`
- Tien cong ky thuat = `thoi gian ky thuat * don gia cong/gio`
- Chi phi khac nhap cho ca lo va chia deu theo so luong
- Trong luong va thoi gian in nhap theo 1 san pham
- Du phong in hong theo phan tram
- Gia von va gia ban de xuat lam tron len boi so 500d

## Da thuc hien

- Cap nhat `Printer`:
  - Xoa `costPerHour`
  - Them `purchasePrice`
  - Them `lifetimeHours`
- Cap nhat du lieu mau may in trong `src/data/sampleData.ts`.
- Cap nhat form, bang va trang quan ly may in.
- Cap nhat calculator form voi cac truong:
  - `technicalHours`
  - `technicalRate`
  - `quantity`
  - `otherCost`
  - `risk`
- Cap nhat cong thuc trong `src/utils/calculator.ts`.
- Cap nhat giao dien nhap lieu calculator.
- Cap nhat summary voi breakdown chi phi va tong tien theo lo.
- Them helper `roundUpTo500` trong `src/utils/currency.ts`.

## Trang thai hien tai

Da hoan tat toan bo checklist ben duoi. `npm run build` va `npm run lint` deu pass (lint chi con 2 warning `react(only-export-components)` khong lien quan, co san tu truoc trong `DataContext.tsx` va `ToastContext.tsx`).

## Checklist (da hoan tat)

### 1. Sua loi TypeScript hien tai — xong

- `PrinterForm.tsx` da gui `powerWatt` trong payload `onSubmit`.
- `PrinterSortKey` da co `lifetimeHours`, header sort trong `PrinterTable.tsx`/`PrintersPage.tsx` dung khop.
- `npm run build` pass.

### 2. Dong bo ten truong va tham chieu cu — xong

- Da tim trong toan bo `src/`, khong con tham chieu `costPerHour`, `extraCost`, `printerCost` cu; `totalCost`/`subtotalCost` chi la ten truong moi, dung schema.
- `PrinterInput`, `Printer`, sample data, form, table, detail modal, calculator deu dung chung schema (`purchasePrice`, `lifetimeHours`, `powerWatt`).
- Du lieu localStorage cu khong tuong thich: da them `isValidPrinter` + `loadPrinters` trong `DataContext.tsx` de validate schema khi doc tu localStorage, tu dong fallback ve `initialPrinters` neu du lieu cu (vd con `costPerHour`) khong hop le. Khong migrate vi khong the suy ra `purchasePrice`/`lifetimeHours` tu `costPerHour` cu.

### 3. Xac nhan cong thuc calculator — xong

- Da doi chieu `src/utils/calculator.ts` voi chuoi tinh trong muc tieu: nhua, dien, khau hao (guard `lifetimeHours > 0`), tien cong, chi phi khac chia deu, tam tinh, du phong, gia von/san pham (lam tron 500), gia ban de xuat (lam tron 500, null neu khong co margin), gia von/gia ban ca lo. Khop hoan toan.
- Da test tay tren UI voi 1 bo so lieu thuc te, ket qua tinh tay va UI khop 100% (gia von 110.500d, gia ban 133.000d).

### 4. Kiem tra validation va form state — xong

- `CalculatorFormState`/`DEFAULT_FORM_STATE`/`validateCalculatorForm` da dung du cac truong `technicalHours`, `technicalRate`, `quantity`, `otherCost`, `risk`.
- Da them `requirePositiveInteger` cho truong `quantity` (truoc do dung `requirePositiveNumber`, cho phep so thap phan).
- Ten key loi khop voi input trong `Calculator.tsx`.

### 5. Kiem tra giao dien calculator — xong

- Da test tren browser: chon plastic + printer active, nhap weight/hours/quantity/technicalHours/technicalRate/risk/otherCost, breakdown va tong tien hien dung, dung % moi dong.
- Da xac nhan margin de trong chi hien gia von, an gia ban de xuat (theo logic `suggestedPrice` tra ve `null`).

### 6. Kiem tra trang quan ly may in — xong

- Da test tren browser: bang desktop hien du 4 may in, dung du lieu (gia mua/tuoi tho, cong suat, trang thai).
- Da mo modal "Xem chi tiet", hien dung gia mua, tuoi tho, khau hao/gio tinh tu du lieu may in.
- Cac cot sort (ten, cong suat, gia mua, ngay tao) dung field trong `PrinterSortKey`.

### 7. Build, lint va hoan tat — xong

- `npm run build`: pass.
- `npm run lint` (oxlint): pass, chi con 2 warning fast-refresh khong lien quan (co san tu truoc, khong phai do thay doi lan nay).
- Khong co test framework trong repo (khong co script `test` trong `package.json`, khong co file test).
- `get_errors` sach cho tat ca file da sua (`DataContext.tsx`, `calculatorForm.ts`).

## Luu y

Gia mua va tuoi tho cua may Ender 3 V3, Saturn 3 cung nhu mot so gia mua mau hien la gia tri uoc tinh. Can dieu chinh theo du lieu thuc te.

Khong reset hoac ghi de cac thay doi khac cua nguoi dung trong working tree.
