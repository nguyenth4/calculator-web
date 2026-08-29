# Handoff tam thoi

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
