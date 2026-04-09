# README PHAN TICH DU AN

## 1. Tong quan du an

Day la he thong quan ly trung tam hoc tap theo mo hinh fullstack:

- `backend`: Node.js + Express + MongoDB + Mongoose
- `frontend`: React + Vite + Context API
- Co che nghiep vu chinh:
  - Quan ly tai khoan va phan quyen
  - Quan ly lop hoc
  - Sinh lich hoc/buoi hoc
  - Diem danh
  - Day bu, day thay
  - Xac nhan buoi day bang ma OTP
  - Tinh luong giao vien theo thang
  - Gui thong bao noi bo

Ban chat day la mot he thong CRUD co them lop xu ly nghiep vu trung tam nam o:

- sinh session tu lich hoc
- kiem tra trung lich giao vien
- sinh lich bu thong minh
- chi cho diem danh trong khung gio hop le
- chi tinh luong voi session da `confirmed`

---

## 2. Kien truc tong the

## 2.1 Backend

Backend di theo flow:

`Route -> Controller -> Service -> Model/Utils -> MongoDB`

Y nghia tung tang:

- `routes`: khai bao endpoint
- `controllers`: nhan request, boc tach du lieu, goi service, tra response
- `services`: chua logic nghiep vu chinh
- `models`: dinh nghia schema MongoDB
- `utils/helpers`: cac ham xu ly dung lai nhieu noi
- `middlewares`: xac thuc, phan quyen, upload file
- `jobs`: tac vu khoi dong he thong

Day la mot dang **Layered Architecture**. Uu diem:

- Tach ro HTTP va nghiep vu
- De doc, de test theo tung tang
- De mo rong them module

## 2.2 Frontend

Frontend di theo flow:

`Page/Component -> Context/Hook -> API Service -> Axios -> Backend API`

Tung tang:

- `pages`: man hinh nghiep vu
- `contexts`: quan ly state va action theo tung domain
- `hooks`: tach logic UI/filter/pagination
- `services/apis/api.js`: tap trung cac ham goi API
- `utils`: ham xu ly ngay gio, route guard, mapping form

Frontend dang dung **Context Provider Pattern** + **Custom Hooks Pattern**.

---

## 3. Design pattern dang su dung

## 3.1 Layered Architecture

Xuat hien ro o backend:

- `auth.routes.js` -> `auth.controller.js` -> `auth.service.js` -> `user.model.js`, `refreshToken.model.js`
- `class.routes.js` -> `class.controller.js` -> `class.service.js` -> `class.model.js`, `session.model.js`

Gia tri:

- Service chiu trach nhiem nghiep vu
- Controller mong, de bao tri

## 3.2 Service Layer Pattern

Hau het logic nam trong `services`:

- `auth.service.js`: login, refresh token, logout, reset password
- `class.service.js`: tao lop, sinh session, import hoc vien
- `session.service.js`: tao session thuong, off/makeup, slot ranh
- `attendance.service.js`: rang buoc thoi gian diem danh
- `teacherSalary.service.js`: tinh luong
- `notification.service.js`: thong bao

## 3.3 Repository-like Access Through Model

Du an chua tach repository rieng, nhung service dang truy cap Mongo thong qua Mongoose model nhu mot repository don gian.

Vi du:

- `User.findOne(...)`
- `Session.find(...)`
- `Salary.findOneAndUpdate(...)`

## 3.4 Context Pattern

Frontend tach state theo domain:

- `AuthContext`
- `UserContext`
- `CourseContext`
- `SalaryContext`
- `NotificationContext`

Uu diem:

- Khong can Redux
- Hop voi du an vua va nho
- Truyen state xuong page de dang

## 3.5 Guard Pattern

Frontend dung `RouteGuard.jsx` de chan route theo:

- da dang nhap chua
- da hoan tat ho so chua
- role co hop le khong
- token reset password con han khong

## 3.6 Interceptor Pattern

`frontend/src/utils/axios.customize.js` dung interceptor de:

- gan `Authorization: Bearer <token>` vao moi request
- tu refresh access token khi bi `401`

Day la pattern rat quan trong de giu phien dang nhap on dinh.

## 3.7 Scheduler Pattern

- Backend: khi khoi dong server se chay job cap nhat trang thai lop va gui thong bao buoi hoc hom nay
- Frontend: `scheduler.js` kiem tra access token dinh ky 10 giay/lần va refresh truoc khi het han

---

## 4. Cau truc co so du lieu va design DB

Du an dung MongoDB, thiet ke theo huong **hybrid document model**:

- Quan he chinh luu bang `ObjectId ref`
- Mot so du lieu nho, co tinh chat gan bo duoc `embed`

## 4.1 Bang `users`

File: `backend/models/user.model.js`

Muc dich:

- Quan ly tat ca loai nguoi dung: `student`, `teacher`, `admin`

Thuoc tinh quan trong:

- `user_type`: vai tro
- `email`, `password`
- `first_name`, `last_name`
- `phone_number`, `address`, `date_of_birth`
- `avatar`
- `is_complete_profile`
- `is_online`, `last_seen`

Nhan xet thiet ke:

- Dung **single collection for multiple roles**
- Giu duoc cau truc don gian
- Phu hop khi teacher/student/admin co nhieu field chung

## 4.2 Bang `classes`

File: `backend/models/class.model.js`

Muc dich:

- Luu thong tin lop hoc tong quat

Thuoc tinh:

- `name`, `description`
- `duration`
- `teacher_id -> User`
- `start_date`, `end_date`
- `start_time`, `end_time`
- `status`
- `days_of_week`
- `number_of_sessions_per_week`
- `students[]`

Thiet ke DB dang dung:

- `teacher_id` la `ref`
- `students` la **embedded array**

Y nghia:

- Giao vien chu nhiem la quan he 1-n ro rang, nen dung ref
- Danh sach hoc vien duoc embed vi can xem nhanh theo lop, them/xoa trong mot document

Uu diem:

- Lay danh sach hoc vien trong lop rat nhanh
- Phu hop khi so hoc vien/lop khong qua lon

Rui ro:

- Neu lop rat dong hoc vien, document co the phinh to
- Chua co collection enrollment rieng nen kho phan tich sau nay

## 4.3 Bang `sessions`

File: `backend/models/session.model.js`

Day la bang nghiep vu quan trong nhat.

Muc dich:

- Luu tung buoi hoc cu the da duoc sinh ra tu lop

Thuoc tinh:

- `class_id -> Class`
- `session_date`
- `start_time`, `end_time`
- `topic`
- `is_makeup`
- `is_canceled`
- `substitute_teacher_id -> User`
- `teaching_code`, `code_expiry`
- `confirmed`
- `attendance[]`

Chi muc:

- unique index: `(class_id, session_date, start_time, end_time)`
- index truy van: `(class_id, session_date)`
- index truy van giao vien day thay: `(substitute_teacher_id)`

Nhan xet thiet ke:

- Session la don vi su that de:
  - diem danh
  - xac nhan buoi day
  - tinh luong
  - day bu/day thay
- `attendance[]` duoc embed trong session vi diem danh gan chat voi buoi hoc

Uu diem:

- Moi nghiep vu xoay quanh session rat de gom logic
- Tinh luong va diem danh khong can join phuc tap

## 4.4 Bang `salaries`

File: `backend/models/salary.model.js`

Muc dich:

- Luu ket qua tong hop luong theo giao vien/thang/nam

Thuoc tinh:

- `teacher_id`
- `month`, `year`
- `rate_per_session`
- `substitute_coefficient`
- `makeup_coefficient`
- `total_sessions`
- `total_makeup_sessions`
- `total_substitute_sessions`
- `total_salary`

Ban chat day la bang **aggregate snapshot**:

- du lieu khong phai goc
- duoc tinh tu `sessions`
- giup truy van bao cao nhanh

## 4.5 Bang `notifications`

File: `backend/models/notification.model.js`

Muc dich:

- Luu thong bao cho tung user

Thuoc tinh:

- `user_id`
- `type`
- `title`, `message`
- `related_id`
- `notify_date`
- `is_read`

Thiet ke:

- Moi thong bao la mot document rieng
- Admin duoc tao nhieu document mot luc bang `insertMany`

## 4.6 Bang `refresh_tokens`

File: `backend/models/refreshToken.model.js`

Muc dich:

- Quan ly refresh token theo tung phien dang nhap

Thuoc tinh:

- `user_id`
- `token`
- `expires_at`
- `is_revoked`

Day la pattern tot hon viec chi luu refresh token o client, vi:

- co the revoke
- logout 1 thiet bi
- logout all devices
- rotation token

## 4.7 Ket luan ve DB pattern

Du an dang ap dung:

- **Reference Pattern** cho cac quan he chinh
- **Embedded Document Pattern** cho du lieu phu thuoc chat vao document cha
- **Aggregate Snapshot Pattern** cho luong
- **Session-centric domain model**: session la tam cua nghiep vu

Danh gia:

- Rat hop ly voi bai toan trung tam hoc
- De bao cao va trich xuat nghiep vu
- Co the nang cap sau nay bang collection enrollment rieng neu muon mo rong lon

---

## 5. Backend flow chi tiet

## 5.1 Flow khoi dong he thong

File chinh: `backend/server.js`

Trinh tu:

1. Doc env
2. Ket noi MongoDB
3. Seed tai khoan admin
4. Cap nhat trang thai lop hoc
5. Gui thong bao cac buoi hoc hom nay
6. Mo server Express

Y nghia:

- He thong tu dong "dong bo lai trang thai" ngay khi start
- Giam phu thuoc vao thao tac tay cua admin

## 5.2 Flow request backend

Mot request thuong di theo:

1. client goi API
2. route map den controller
3. controller kiem tra input co ban
4. middleware xac thuc/phan quyen neu can
5. service xu ly nghiep vu
6. model truy cap DB
7. controller tra JSON

---

## 6. Phan tich logic tung module backend

## 6.1 Module xac thuc va tai khoan

### `auth.middleware.js`

Chuc nang:

- doc `Authorization`
- tach Bearer token
- verify token bang `ACCESS_TOKEN_SECRET`
- gan `req.user`

Day la lop **authentication gate** cho cac route private.

### `role.middleware.js`

Chuc nang:

- doc `req.user.role`
- kiem tra role co nam trong danh sach duoc phep khong

Day la lop **authorization gate**.

### `utils/jwt.js`

Ham quan trong:

- `generateAccessToken(user)`
- `generateRefreshToken(user)`
- `verifyAccessToken(token)`
- `verifyRefreshToken(token)`

Y nghia:

- access token chua `id`, `email`, `role`, `is_complete_profile`
- refresh token toi gian hon, chi can `id`

### `services/auth.service.js`

Day la service auth day du nhat.

#### `register`

- kiem tra email trung
- hash password
- tao user moi

#### `login`

- tim user theo email
- so khop password
- tao access token
- tao refresh token
- luu refresh token vao DB
- danh dau user online
- set cookie `refreshToken`

#### `refreshToken`

- verify refresh token
- kiem tra token co ton tai trong DB khong
- kiem tra revoke/expire
- revoke token cu
- tao cap token moi
- set lai cookie

Day la **Refresh Token Rotation Pattern**.

#### `logout`

- revoke refresh token hien tai
- clear cookie
- cap nhat offline

#### `logoutAll`

- revoke toan bo token cua user

#### `forgotPassword`

- tao token reset password ton tai 15 phut
- dung email de gui link reset

#### `resetPassword`

- verify token reset
- khong cho dat password trung password cu
- hash password moi
- revoke toan bo refresh token

#### `completeProfile`

- cap nhat du thong tin bat buoc
- dat `is_complete_profile = true`

#### `handleHeartbeat`

- cap nhat online/last_seen dinh ky

### `utils/sendEmail.js`

Co 2 nhom email:

- email reset password
- email gui ma xac nhan buoi day

Code nay dong vai tro **infrastructure utility**, tach rieng khoi service nghiep vu.

## 6.2 Module user

### `services/user.service.js`

#### `getAllUsers`

- lay danh sach user, bo password

#### `getUsersByName`

- tim theo `first_name` hoac `last_name`
- dung regex khong phan biet hoa thuong

#### `getUsersByRole`

- loc theo `user_type`

#### `updateUser`

- admin doi password/role cho user

#### `updateUserAccount`

- user tu cap nhat thong tin ca nhan
- co ho tro avatar
- tu dong tinh lai `is_complete_profile`

#### `deleteUserById`

- xoa user

## 6.3 Module class

### `services/class.service.js`

Day la service nghiep vu phuc tap nhat.

#### `computeEndDate`

- tinh `end_date` dua tren `start_date + duration * 7 - 1`
- tuc la duration duoc tinh theo so tuan

#### `generateSessions`

Flow:

1. chuan hoa `days_of_week`
2. sinh danh sach ngay hoc du kien
3. voi moi ngay:
   - lay khung gio mac dinh cua lop
   - kiem tra giao vien co bi trung lich khong
   - neu trung, tim slot bu thong minh
   - tao `Session`

Day la logic "tu dong lap lich" cua he thong.

#### `createClass`

Flow:

1. normalize ngay hoc
2. validate `start_date`, `end_date`, `duration`
3. validate khung gio 07:30 -> 22:30
4. tao document `Class`
5. goi `generateSessions`
6. cap nhat `end_date` thuc te theo session cuoi
7. tim khung gio xuat hien nhieu nhat de dong bo lai lop

#### `getAllClasses`

- co ho tro loc theo `teacherId`
- co option `includeSubstitute`
- populate giao vien chinh va hoc vien
- nap them sessions theo class
- tu gom `assigned_substitute_teacher_ids`

#### `getClassesByDate`

- tim tat ca session cua 1 ngay
- group lai theo class
- dung cho man hinh lich

#### `getClassById`

- lay chi tiet lop
- lay toan bo session cua lop

#### `updateClass`

Flow:

1. tim lop cu
2. validate du lieu moi
3. update lop
4. xoa toan bo session cu
5. sinh lai session moi

Day la cach xu ly de, nhung co tac dong lon:

- uu diem: de dam bao lich dong bo
- nhuoc diem: neu da diem danh/confirmed ma update lop, co nguy co mat du lieu session cu

#### `deleteClass`

- xoa session truoc
- xoa class sau

#### `uploadStudentsFromExcel`

Flow:

1. doc file Excel
2. lay email tung dong
3. doi chieu user trong DB
4. bo qua user loi/trung
5. push vao `class.students`

#### `removeStudent`

- loc hoc vien khoi mang embed

## 6.4 Module session

### `services/session.service.js`

#### `createAttendanceIfNeeded`

- chi tao danh sach diem danh neu:
  - session chua co attendance
  - hien dang trong khung gio hoc

Neu hop le:

- clone danh sach hoc vien tu class
- mac dinh moi hoc vien `absent`

Day la logic hay, vi:

- diem danh khong tao qua som
- diem danh khong tao sau khi het gio

#### `createAttendanceForNormalSession`

- lay session hom nay cua class
- neu session bi huy thi dung
- neu co giao vien day thay thi cap nhat `substitute_teacher_id`
- goi `createAttendanceIfNeeded`

#### `createMakeupOrOffSession`

Flow:

1. tim session bi off
2. danh dau session do `is_canceled = true`
3. xoa attendance cu
4. tao session moi vao ngay bu
5. danh dau `is_makeup = true`
6. neu ngay bu trung hom nay, tao attendance ngay

#### `getTeacherFreeSlotsInDay`

- lay tat ca session cua giao vien trong ngay
- tinh cac khoang trong bang `getFreeTimeSlots`

#### `getAvailableTeachers`

- lay session trong ngay
- tim giao vien dang ban trong khung gio
- tra ve danh sach teacher con ranh

## 6.5 Module attendance

### `services/attendance.service.js`

#### `validateAttendanceUpdateWindow`

Chi cho cap nhat diem danh khi:

- dung ngay hoc
- hien tai nam trong khoang `start_time -> end_time`

Day la business rule rat ro rang.

#### `updateSessionAttendance`

Flow:

1. validate input
2. validate status
3. tim session
4. validate khung gio cap nhat
5. tim ban ghi attendance cua hoc vien
6. neu status = `HUY` thi xoa ban ghi
7. neu ton tai thi update
8. neu chua ton tai thi them moi

#### `getAttendanceBySession`

- tra thong tin session + danh sach diem danh da populate hoc vien

#### `getStudentAttendanceInClass`

- duyet tat ca session cua class
- tra lich su diem danh cua 1 hoc vien

## 6.6 Module teaching code va salary

### `services/teachingCode.service.js`

#### `generateTeachingCode`

- sinh ma so ngau nhien 6 chu so

#### `createAndSendCode`

Chi duoc gui ma khi:

- session ton tai
- khong bi huy
- la buoi hoc hom nay
- session chua confirmed
- dang nam trong khung gio hoc

Sau do:

- tim giao vien day that su
- gan `teaching_code`, `code_expiry`
- gui email

#### `confirmSessionCode`

- tim session theo `sessionId + code + code_expiry`
- dat `confirmed = true`

Y nghia nghiep vu:

- Session chi duoc tinh luong khi da xac nhan day xong

### `services/teacherSalary.service.js`

#### `calculateMonthlySalaries`

Flow:

1. lay tat ca giao vien
2. lay session trong thang, da `confirmed`, khong bi huy
3. tinh thong ke cho tung giao vien:
   - buoi thuong
   - buoi bu
   - buoi day thay
4. tinh tien theo he so
5. upsert vao bang `Salary`
6. gui thong bao cho giao vien va admin

Day la logic **batch aggregation by month**.

#### `getAllSalaries`

- tra danh sach luong tong hop theo giao vien

#### `getAllSalariesForExcel`

- group theo giao vien -> theo lop
- phuc vu xuat bao cao

#### `getByTeacher`

- lay chi tiet luong 1 giao vien
- boc tach theo tung lop

#### `updateRateAndCoefficients`

- cap nhat cau hinh luong hang loat

## 6.7 Module notification

### `services/notification.service.js`

#### `createNotification`, `notifyUser`, `notifyAdmin`

- tao thong bao cho 1 user hoac nhieu admin

#### `getNotificationsByUser`, `getUnreadCountByUser`

- lay danh sach va dem so thong bao chua doc

#### `markNotificationAsRead`, `markAllNotificationsAsRead`

- cap nhat trang thai doc

#### `hasSalaryNotification`

- tranh gui lap thong bao luong

#### `hasTodayClassNotification`

- tranh gui lap thong bao lich hoc hom nay

### `services/todayClassNotification.service.js`

Khi server start:

- tim tat ca session hom nay
- gui thong bao cho:
  - giao vien
  - hoc vien trong lop
  - admin

---

## 7. Phan tich utils/helper backend

## 7.1 `utils/helper.js`

Co nhom ham dung chung:

- `toMinutes(time)`: doi gio `HH:mm` sang phut
- `isTimeOverlap(...)`: kiem tra trung khung gio
- `formatToVN(date)`: format ngay theo Viet Nam
- `getDateRange(start, end)`: sinh danh sach ngay trong khoang

Vai tro:

- helper tong quat muc co ban

## 7.2 `utils/timeUtils.js`

Day la utility quan trong cho bai toan lich hoc.

Ham:

- `toMinutes`
- `minutesToHHMM`
- `addMinutesToTime`
- `isOverlapping`
- `getFreeTimeSlots`

Gia tri:

- chuan hoa toan bo logic xu ly khung gio
- tranh lap code trong session/class scheduling

## 7.3 `utils/dateUtils.js`

Ham:

- parse ngay theo gio VN
- cong ngay
- format ngay
- lay hom nay theo VN
- format ra giao dien

Vai tro:

- phuc vu xu ly ngay co tinh don gian

## 7.4 `utils/dateUtilsForSession.js`

Ban nang cap hon cua date util, phuc vu session/salary:

- `getTodayVNStr`
- `parseSessionDate`
- `parseVNDateStartOfDay`
- `parseVNDateEndOfDay`
- `buildMonthRange`
- `formatDateToISO`

Vai tro:

- dam bao truy van session theo ngay/thang dung mui gio

## 7.5 `utils/timeUtilsForSession.js`

Ham:

- `timeStrToMinutes`
- `getCurrentMinutesVN`

Vai tro:

- kiem tra business rule theo thoi gian thuc te

## 7.6 `utils/scheduleHelper.js`

Day la helper scheduling quan trong nhat.

Ham:

- `normalizeDaysOfWeek`
- `generatePlannedSessions`
- `checkTeacherConflict`
- `findMakeupSlot`
- `findSlotsForDate`

Phan tich:

- `normalizeDaysOfWeek` lam sach du lieu ngay hoc
- `generatePlannedSessions` sinh lich hoc theo tuan
- `checkTeacherConflict` phat hien trung lich giao vien
- `findMakeupSlot` tim slot ranh uu tien:
  - cung ngay
  - phan con lai trong tuan hien tai
  - tuan tiep theo
  - xa hon trong khoang tim kiem

Day la logic "thong minh" nhat cua he thong.

## 7.7 `utils/excelHelper.js`

Vai tro:

- xuat bang luong giao vien ra Excel co format

Tinh nang:

- style cot/header
- dong tong theo giao vien
- dong tong toan he thong

## 7.8 `utils/sendEmail.js`

Vai tro:

- dong goi viec gui email
- tach ha tang email ra khoi nghiep vu

---

## 8. Frontend flow chi tiet

## 8.1 Boot app

File: `frontend/src/main.jsx`

Trinh tu:

1. `initAuth()` khoi dong auth scheduler
2. render `BrowserRouter`
3. boc app bang cac provider:
   - `AuthProvider`
   - `NotificationProvider`
   - `SalaryProvider`
   - `CoursesProvider`
   - `UserProvider`

Y nghia:

- state toan cuc duoc tach theo domain

## 8.2 Auth flow frontend

### `services/auth/token.js`

- luu/xoa token trong `localStorage`
- decode JWT
- kiem tra sap het han

### `services/auth/refreshManager.js`

Flow:

1. neu dang refresh thi request moi vao queue
2. goi `/auth/refresh-token`
3. luu access token moi
4. giai phong queue
5. neu that bai thi xoa localStorage va day ve `/login`

Day la pattern queue khi refresh token rat dung.

### `services/auth/scheduler.js`

- moi 10 giay kiem tra token
- neu sap het han trong 30 giay thi refresh

### `contexts/authentication/AuthContext.jsx`

Quan ly:

- `user`
- `loading`
- login/register/logout
- complete profile
- forgot/reset password
- heartbeat moi 60 giay

AuthContext dong vai tro trung tam cua frontend.

## 8.3 Route flow

### `utils/RouteGuard.jsx`

- `ProtectedRoute`: phai dang nhap va complete profile
- `GuestRoute`: nguoi da login khong duoc vao trang login/register
- `RoleRoute`: chan theo role
- `IncompleteProfileRoute`: chi cho user chua hoan tat ho so
- `ResetPasswordGuard`: token reset phai hop le

### `routers/AppRoutes.jsx`

Role chinh:

- `admin`: user, student, teacher, salary, setting
- `teacher`: my-salary
- `all roles`: list-course, calendar, class-detail, account-detail

---

## 9. Phan tich logic frontend theo domain

## 9.1 API layer

File: `frontend/src/services/apis/api.js`

Vai tro:

- tap trung tat ca ham goi API
- gom theo domain:
  - auth
  - user
  - class/course
  - session
  - attendance
  - salary
  - notification

Uu diem:

- page/context khong can viet axios truc tiep
- de doi endpoint

## 9.2 Axios layer

File: `frontend/src/utils/axios.customize.js`

Vai tro:

- gan token vao request
- tu refresh neu 401

Day la cau noi giua UI va backend auth.

## 9.3 Course context

File: `frontend/src/contexts/courses/CourseContext.jsx`

Quan ly:

- danh sach `courses`
- loading
- action tao/sua/xoa lop
- upload hoc vien
- tao session hom nay
- tao buoi bu
- diem danh
- gui/xac nhan teaching code

Day la domain state manager cho nghiep vu lop hoc.

## 9.4 User context

File: `frontend/src/contexts/users/UserContext.jsx`

Quan ly:

- fetch users
- filter role
- update account
- update account detail
- delete account

## 9.5 Salary context

File: `frontend/src/contexts/salaries/SalaryContext.jsx`

Quan ly:

- load bang luong
- load chi tiet luong
- export Excel

## 9.6 Notification context

File: `frontend/src/contexts/notifications/NotificationContext.jsx`

Quan ly:

- fetch notification
- mark all read

---

## 10. Phan tich utils/helper/hook frontend

## 10.1 `utils/dateUtils.js`

Chua nhieu ham xu ly ngay cho UI:

- format ngay hien thi
- lay hom nay/ngay mai theo gio VN
- parse date
- convert UTC -> VN
- localStorage cho ngay dang chon

Nhom nay phuc vu man hinh lich, session va display.

## 10.2 `utils/timeUtils.js`

- `timeToMinutes`

Don gian nhung quan trong cho so sanh gio tren UI.

## 10.3 `utils/monthHelper.js`

Ham:

- lay thang nam hien tai
- tinh thang truoc/sau
- khoa nut next neu da den thang hien tai

Phuc vu man hinh luong.

## 10.4 `utils/courseHelpers.js`

Ham:

- `courseToFormValues(course)`: map du lieu API -> form
- `buildPayload(values)`: map form -> payload API

Day la pattern **mapper/adapter** giua UI va backend.

## 10.5 `utils/AutoCalculateEndTime.js`

- tu dong set `end_time = start_time + 3h`

Giup dong bo voi quy uoc session 180 phut.

## 10.6 `utils/getVietnameseDays.js`

- doi so thu tu ngay sang chu Viet

## 10.7 `hooks/useClickOutSide.js`

- bat su kien click ngoai modal/dropdown de dong UI

## 10.8 `hooks/usePagination.js`

- tinh `currentPage`, `totalPages`, `currentItems`

## 10.9 `hooks/useFetch.js`

- custom hook fetch tong quat
- quan ly `data/loading/error/refetch`

## 10.10 `hooks/useUserFilter.js`

- tim user theo email
- loc theo role
- co debounce

## 10.11 `hooks/useCourseFilter.js`

Hook nay kha quan trong.

Nghiep vu:

- tim lop theo ten
- loc theo giao vien
- loc theo status
- phan biet giao vien chinh va giao vien duoc gan day thay/day bu
- ket hop pagination

## 10.12 `hooks/useUserUI.js`

- quan ly modal edit/delete/create
- quan ly dropdown
- dong UI khi click outside

## 10.13 `hooks/useCourseUI.js`

- quan ly modal form/delete cua lop hoc

---

## 11. Flow nghiep vu chinh de bao cao

## 11.1 Flow dang ky va hoan tat ho so

1. User dang ky bang email/password
2. He thong tao user voi role mac dinh `student`
3. User dang nhap
4. Backend tra access token + refresh token
5. Frontend luu access token va user
6. Neu chua complete profile, route bat buoc vao man hinh hoan tat ho so

## 11.2 Flow dang nhap va duy tri phien

1. User login
2. Backend luu refresh token vao DB va cookie
3. Frontend luu access token vao localStorage
4. Axios tu gan access token vao moi request
5. Scheduler tu refresh token khi sap het han
6. Khi logout, refresh token bi revoke

## 11.3 Flow tao lop hoc

1. Admin nhap thong tin lop
2. Backend validate lich hoc va khung gio
3. Tao document `Class`
4. Sinh danh sach `Session`
5. Neu trung lich giao vien, tim slot bu thong minh
6. Luu session vao DB

## 11.4 Flow import hoc vien vao lop

1. Admin upload file Excel
2. Backend doc tung dong email
3. Doi chieu user ton tai
4. Bo qua dong loi/trung
5. Them hoc vien vao `class.students`

## 11.5 Flow tao session hom nay va diem danh

1. Giao vien/Admin chon lop
2. He thong tim session cua hom nay
3. Neu hop le va dang trong gio hoc:
   - tao attendance cho tat ca hoc vien
   - mac dinh `absent`
4. Giao vien doi status tung hoc vien

## 11.6 Flow off va hoc bu

1. Chon buoi hoc can nghi
2. Danh dau session cu `is_canceled = true`
3. Tao session moi vao ngay bu
4. Co the gan giao vien day thay
5. Neu ngay bu la hom nay thi tao attendance ngay

## 11.7 Flow day thay va xac nhan day

1. Session co the duoc gan `substitute_teacher_id`
2. Trong gio hoc, he thong gui ma xac nhan qua email
3. Giao vien nhap ma
4. Session duoc dat `confirmed = true`
5. Session confirmed moi duoc dua vao tinh luong

## 11.8 Flow tinh luong giao vien

1. Admin chon thang/nam
2. He thong lay session da confirmed, khong bi huy
3. Tong hop:
   - buoi thuong
   - buoi bu
   - buoi day thay
4. Tinh tong luong theo he so
5. Upsert vao bang `Salary`
6. Gui thong bao cho giao vien va admin
7. Co the export Excel

## 11.9 Flow thong bao

1. Khi server start, he thong gui thong bao session hom nay
2. Khi tinh luong, he thong gui thong bao luong moi
3. User doc thong bao o frontend
4. Co the danh dau da doc tat ca

---

## 12. Danh gia uu diem ky thuat

- Kien truc tach tang ro rang
- Session la trung tam nghiep vu, de bao tri
- Auth co refresh token rotation
- Co role-based access control
- Co xu ly mui gio Viet Nam kha nhat quan
- Co helper scheduling tim slot ranh
- Co salary snapshot de truy van nhanh
- Frontend tach context theo domain ro
- API layer va axios interceptor duoc to chuc hop ly

---

## 13. Diem can luu y khi bao cao

Ban co the neu them phan "han che va huong cai tien" de bai bao cao thuyet phuc hon:

### 13.1 Han che hien tai

- `updateClass()` dang xoa toan bo session cu roi sinh lai
- `students` dang embed trong `Class`, co the kho mo rong neu quy mo lon
- Chua co lich chay cron thuc su, hien moi chay job luc startup
- Chua thay validation schema tap trung nhu Joi/Zod o backend
- Chua tach repository layer rieng
- Chua thay transaction MongoDB cho cac thao tac cap nhat nhieu bang

### 13.2 Huong cai tien

- Tach `enrollments` thanh collection rieng neu he thong lon
- Them cron job hang ngay de cap nhat trang thai va gui notification
- Dung transaction cho cac nghiep vu nhieu buoc
- Them validator schema request
- Them test cho service layer
- Luu audit log cho thao tac quan trong

---

## 14. Ket luan

Day la du an co huong thiet ke tot cho bai toan quan ly trung tam hoc:

- backend tach tang ro
- frontend tach domain state ro
- DB thiet ke xoay quanh `Class`, `Session`, `Salary`, `Notification`
- cac helper/utils giai quyet dung bai toan ngay gio, trung lich, diem danh, luong

Neu thuyet trinh, ban nen nhan manh 3 diem lon:

1. `Session` la hat nhan nghiep vu cua he thong
2. Co che `refresh token + teaching code + attendance window` la 3 lop kiem soat quan trong
3. He thong khong chi CRUD ma co xu ly nghiep vu thuc te: lap lich, day bu, day thay, tinh luong, thong bao

---

## 15. Tom tat ngan gon de dung trong slide

Co the trinh bay bang 1 doan ngan:

> Du an duoc xay dung theo kien truc fullstack React + Node.js + MongoDB. Backend ap dung mo hinh Layered Architecture gom Route, Controller, Service, Model va Utils. Trong do `Session` la trung tam nghiep vu, dung de quan ly lich hoc, diem danh, xac nhan day va tinh luong. Database ket hop giua `reference` va `embedded document`, giup truy van nhanh ma van giu duoc quan he ro rang. Frontend su dung Context API, custom hooks, route guard va axios interceptor de quan ly state, phan quyen va phien dang nhap. Diem manh cua he thong nam o logic xu ly lich day, day bu, day thay, gui thong bao va tinh luong giao vien theo session da xac nhan.
