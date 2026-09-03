## **মূল System Structure**

## আমি অ্যাপটাকে মোটামুটি এই ৬টি Core Module-এ ভাগ করব:

### **A. Dashboard**

## শুধু পরিচালনাকারী টিমের জন্য।

## Dashboard-এ থাকবে:

* ## আজকের মোট Meal

* ## আজ দুপুরের Meal

* ## আজ রাতের Meal

* ## মোট Registered Students

* ## মোট টাকা সংগ্রহ

* ## মোট Due

* ## মোট Expense

* ## হাতে থাকা/Available Balance

* ## আজকের Guest Meal

* ## আজকের Expense

* ## Current Management Period

* ## Quick Actions

## উদাহরণ:

> ## **Today's Overview**

> ## Registered Students: 327 >  Lunch: 286 >  Dinner: 301 >  Guest Meals: 12 >  Collected: ৳XX,XXX >  Expenses: ৳XX,XXX >  Due: ৳X,XXX

## ---

# **২. Management Period**

## এটা খুব গুরুত্বপূর্ণ।

## যেহেতু একেকটি Student Team 10 দিন, 12 দিন, 15 দিন বা অন্য কোনো সময় দায়িত্ব পেতে পারে, তাই **Management Period** আলাদা entity হওয়া উচিত।

## যেমন:

## **Management Period \#05**

* ## Start: 01 September

* ## End: 15 September

* ## Managed By: Team A

* ## Meal Price — Lunch: ৳XX

* ## Meal Price — Dinner: ৳XX

* ## Minimum Meal Duration: 3 Days

* ## Feast Date: 08 September, 13 September

## এর ফলে পুরোনো টিমের হিসাব আর নতুন টিমের হিসাব মিশবে না।

## এটা আমি **hard-code করব না**।

## Admin/Manager নিজেরাই ঠিক করতে পারবে:

* ## Start date

* ## End date

* ## Minimum booking days

* ## Lunch price

* ## Dinner price

* ## Feast price

* ## Guest feast price

* ## Payment rules

  ## ---

  # **৩. Student Registration / Meal Booking**

## Management team student-এর information দিয়ে system-এ booking, payment এবং attendance পরিচালনা করবে।

### **1\. Pre-loaded Student Database**

## অ্যাপ চালু করার আগেই:

* ## Block

* ## Room Number

* ## Student Name

* ## Student ID

* ## অন্যান্য প্রয়োজনীয় basic information

## database-এ থাকবে।

## অর্থাৎ organizer-কে নতুন করে student-এর profile তৈরি করতে হবে না।

## ---

### **2\. Meal Booking Flow**

## Student এসে বলবে:

> ## “আমি Block B, Room 204, আগামী ৫ দিনের Lunch \+ Dinner নেব।”

## Operator:

## **Meal Management → New Booking**

## তারপর:

## **Search Student**

## `Block B → Room 204`

## System student-এর তথ্য দেখাবে:

> ## **Nusrat Jahan** >  Block B · Room 204 >  Student ID: XXXXX

## তারপর operator নির্বাচন করবে:

* ## Start Date

* ## End Date / Selected Dates

* ## Lunch ✓

* ## Dinner ✓

* ## Number of Meals

* ## Applicable Price

* ## Total Amount

## তারপর:

## **Confirm Booking**

## ---

### **3\. Operator-ই সব Control করবে**

## Student-এর কোনো login/account-এর প্রয়োজন নেই।

## 

## ---

# **৪. Payment Management**

## Student-এর booking-এর সাথে payment record থাকবে।

## উদাহরণ:

## **Rahim — Block A — Room 203**

| Item | Amount |
| ----- | ----- |
| Lunch — 5 days | ৳500 |
| Dinner — 5 days | ৳500 |
| Total | ৳1,000 |
| Paid | ৳1,000 |
| Due | ৳0 |

## Payment Method:

* ## Cash

* ## bKash

* ## Nagad

* ## Rocket

## এবং payment status:

* ## Paid

* ## Partial

* ## Due

* ## Overpaid / Receivable

## এখানে আমি একটা গুরুত্বপূর্ণ জিনিস রাখব:

### **Payment Transaction History**

## শুধু "Paid" লেখা থাকবে না।

## বরং:

> ## 01 Sep — ৳500 — Cash >  02 Sep — ৳300 — bKash >  03 Sep — ৳200 — Nagad

## তাহলে পরে হিসাব মিলানো অনেক সহজ হবে।

## ---

# **৫. Meal Attendance**

## এটা তোমার requirement-এর সবচেয়ে গুরুত্বপূর্ণ অংশগুলোর একটি।

## একটি আলাদা **Meal Attendance** screen থাকবে।

## ধরো আজ:

### **01 September — Lunch**

| Student | Block | Room | Status |
| ----- | ----- | ----- | ----- |
| Rahim | A | 203 | ✓ |
| Karim | A | 204 | ✓ |
| Sumaiya | B | 101 | — |
| Nusrat | B | 102 | ✓ |

## Operator শুধু এক ক্লিকে:

## **✓ Meal Taken**

## করতে পারবে।

### **কিন্তু Payment Logic থাকবে**

## যদি আগে থেকেই paid থাকে:

> ## ✓ Meal Taken

## শুধু attendance।

## যদি payment due থাকে:

> ## Payment Method:

> * ## Cash

> * ## bKash

> * ## Nagad

> * ## Rocket

> * ## Due

## তাহলে meal mark করার সময়ই payment record করা যাবে।

## ---

# **৬. Guest Meal**

## Guest meal-এর ক্ষেত্রে কোনো advance registration লাগবে না।

## Operator চাপবে:

### **\+ Add Guest Meal**

## তারপর:

* ## Guest Name

* ## Student Name

* ## Block

* ## Room

* ## Meal Type

* ## Date

* ## Quantity

* ## Price

* ## Payment Method

## উদাহরণ:

> ## Guest: Abdullah >  Student: Rahim >  Block: A >  Room: 203 >  Meal: Lunch >  Price: ৳80 >  Payment: Cash

## অথবা:

> ## Payment: Due

## তাহলে সেটা automatically Guest Ledger-এ চলে যাবে।

## ---

# **৭. Receivable / "আমার থেকে পাবে"**

## এটা আমি আলাদা করে রাখব।

## কারণ এটা সাধারণ **Due** না।

## দুই ধরনের balance থাকতে পারে:

### **Payable / Due**

## Student আমাদের কাছে টাকা দেবে।

> ## Rahim owes us ৳100

### **Receivable**

## আমরা Student-কে টাকা ফেরত দেব।

> ## Karim should receive ৳30

## যেমন:

## Student দিয়েছে:

> ## ৳100

## Meal cost:

> ## ৳70

## কিন্তু operator-এর কাছে ৳30 ফেরত দেওয়ার cash নেই।

## তাহলে:

> ## **Receivable: ৳30**

## পরবর্তীতে টাকা ফেরত দিলে:

> ## Settlement → ৳30 Paid

## হবে।

## এতে cash হিসাব অনেক পরিষ্কার থাকবে।

## ---

# **৮. Feast Management**

## Feast-কে Regular Meal-এর মধ্যে না ঢুকিয়ে আলাদা module রাখাই ভালো।

## Management team করতে পারবে:

### **Create Feast**

* ## Feast Date

* ## Lunch / Dinner

* ## Regular Student Price

* ## Guest Price

* ## Maximum Capacity — optional

* ## Menu — optional

## তারপর regular meal students automatically eligible হবে।

## আর যারা regular meal নেয় না তারা:

> ## **Register for Feast**

## করতে পারবে।

## তাদের ক্ষেত্রে:

* ## Name

* ## Block

* ## Room

* ## Student ID

* ## Feast

* ## Payment

## record হবে।

## ---

# **৯. Market / Expense Management**

## এখানে system খুব simple রাখা উচিত।

### **Add Expense**

## **Item**

> ## Chicken

## **Quantity**

> ## 10 KG

## **Total Cost**

> ## ৳2,000

## **Date**

> ## 01 Sep

## **Category**

> ## Grocery / Meat / Vegetable / Others

## **Purchased By**

> ## Team Member

## Optional:

* ## Vendor

* ## Invoice/photo

* ## Note

## তারপর Save।

## ---

# **১০. Expense Ledger**

## সব expense এখানে chronological order-এ থাকবে।

| Date | Item | Qty | Cost | Category |
| ----- | ----- | ----- | ----- | ----- |
| Sep 01 | Chicken | 10 kg | ৳2,000 | Meat |
| Sep 01 | Eggplant | 5 kg | ৳600 | Vegetable |
| Sep 02 | Rice | 50 kg | ৳3,500 | Grocery |

## উপরে থাকবে:

## **Total Expense**

> ## ৳XX,XXX

## এবং চাইলে category breakdown:

* ## Meat — ৳XX

* ## Vegetables — ৳XX

* ## Grocery — ৳XX

* ## Fish — ৳XX

* ## Others — ৳XX

  ## ---

  # **১১. Financial Dashboard**

## এখানেই পুরো system-এর আসল value আসবে।

### **Financial Summary**

## **Total Expected Collection**

## ৳XXX,XXX

## **Total Collected**

## ৳XXX,XXX

## **Total Due**

## ৳XX,XXX

## **Total Expense**

## ৳XXX,XXX

## **Current Balance**

## ৳XX,XXX

## **Student Receivable**

## ৳X,XXX

## ---

### **Formula**

## প্রাথমিকভাবে:

## **Current Balance \= Total Collected − Total Expenses − Receivable**

## তবে এখানে একটা বিষয় পরে ঠিক করতে হবে—**opening cash / previous balance** থাকবে কি না।

## যদি থাকে:

## **Current Balance \= Opening Balance \+ Collections − Expenses − Refunds**

## এটা বাস্তব accounting-এর জন্য বেশি সঠিক।

## ---

# **১২. Search & Filter**

## 300–400 student হলে search খুব গুরুত্বপূর্ণ।

## Operator যেন লিখতে পারে:

> ## "Sumaiya"

## অথবা:

> ## "B-203"

## অথবা:

> ## "Block C"

## তারপর student বের হয়ে যাবে।

## Filter:

* ## Block

* ## Room

* ## Meal Type

* ## Paid

* ## Due

* ## Active

* ## Date

  ## ---

  # **১৩. User Roles**

## আমি এখানে সবাইকে একই access দেব না।

### **Admin**

## Full access:

* ## Management Period

* ## Students

* ## Meal

* ## Payments

* ## Feast

* ## Expenses

* ## Reports

* ## Team Members

* ## Settings

  ### **Manager / Operator**

## প্রায় সব operational feature:

* ## Meal registration

* ## Attendance

* ## Guest meal

* ## Payment

* ## Expense

## কিন্তু sensitive settings পরিবর্তন করতে পারবে না।

### **Viewer — Optional**

## শুধু reports দেখতে পারবে।

## ---

# **১৪. Technology Stack**

## তুমি যেহেতু **Next.js** দিয়ে করতে চাচ্ছো, আমি MVP-এর জন্য এই architecture নেব:

### **Frontend**

## **Next.js \+ TypeScript**

* ## App Router

* ## Tailwind CSS

* ## shadcn/ui

* ## React Hook Form

* ## Zod

* ## TanStack Query — প্রয়োজন অনুযায়ী

  ### **Backend**

## প্রথম MVP-এর ক্ষেত্রে আলাদা backend না বানিয়েও করা সম্ভব।

## **Next.js Server Actions / Route Handlers**

## দিয়ে শুরু করা যায়।

## তবে যদি ভবিষ্যতে:

* ## Multiple halls

* ## Multiple universities

* ## Mobile app

* ## External API

* ## Complex reporting

## করার পরিকল্পনা থাকে, তখন:

## **Next.js → FastAPI → PostgreSQL**

## architecture বেশি scalable হবে।

### **Database**

## আমি **PostgreSQL** recommend করব।

## কারণ এখানে relational data অনেক:

## `Student → Booking → Meal → Attendance → Payment → Transaction`

## এবং:

## `Management Period → Expense → Ledger`

## এরকম relational structure।

## ---

# **১৫. Database-এর Core Tables**

## আমি roughly এই structure রাখব:

* ## users

* ## management\_periods

* ## teams

* ## students

* ## meal\_bookings

* ## meal\_attendance

* ## payments

* ## payment\_transactions

* ## feasts

* ## feast\_registrations

* ## guest\_meals

* ## expenses

* ## expense\_categories

* ## receivables

* ## settlements

  ## audit\_logs

## বিশেষ করে **audit\_logs** রাখাটা গুরুত্বপূর্ণ।

## যেমন কেউ যদি:

> ## Expense ৳2,000 → পরিবর্তন করে ৳1,500

## তাহলে system-এর কাছে history থাকবে:

> ## Edited by: User X >  Previous: ৳2,000 >  New: ৳1,500 >  Time: 10:32 PM

## Accounting system-এ এটা খুব useful।

## ---

# **১৬. UI/UX Theme**

## তুমি যেহেতু বলেছো **clean, formal, university-level**, আমি একদম সেই direction-এ যাব।

## আমি flashy startup UI ব্যবহার করব না।

### **Recommended Visual Direction**

## **Primary:** Deep Navy / Slate  **Background:** Off-white / Very light gray  **Cards:** White  **Success:** Muted Green  **Warning:** Amber  **Danger:** Muted Red

## উদাহরণ:

* ## Navy        → \#1E293B

* ## Slate       → \#475569

* ## Background  → \#F8FAFC

* ## White       → \#FFFFFF

* ## Green       → \#16A34A

* ## Amber       → \#D97706

  ## Red         → \#DC2626

## এতে interface-টা অনেক বেশি **administrative / institutional software**\-এর মতো লাগবে।

## ---

# **১৭. Main Navigation**

## আমি sidebar-এ রাখব:

* ## Dashboard

* ## 

* ## Meal Management

* ##  ├─ Meal Registration

* ##  ├─ Today's Meal

* ##  ├─ Meal Attendance

* ##  └─ Guest Meal

* ## 

* ## Students

* ##  ├─ All Students

* ##  └─ Due / Receivable

* ## 

* ## Feast

* ##  ├─ Feast Schedule

* ##  └─ Feast Registration

* ## 

* ## Finance

* ##  ├─ Payments

* ##  ├─ Expenses

* ##  ├─ Ledger

* ##  └─ Financial Summary

* ## 

* ## Reports

* ##  ├─ Meal Report

* ##  ├─ Payment Report

* ##  ├─ Expense Report

* ##  └─ Final Settlement

* ## 

* ## Management

* ##  ├─ Current Period

* ##  ├─ Team Members

  ##  └─ Settings

  ## ---

  ## **তবে একটা গুরুত্বপূর্ণ বিষয়**

## আমি সরাসরি coding শুরু করতে বলব না।

## কারণ তোমার description থেকে **business logic-এর কয়েকটি জায়গা এখনো ambiguous**, আর এগুলো database তৈরি করার আগে নির্ধারণ করা দরকার।

## বিশেষ করে এই ৬টা:

1. ## **Lunch এবং Dinner-এর price কি সবসময় একই, নাকি আলাদা?**

2. ## **Minimum 3 days বলতে consecutive 3 calendar days, নাকি যেকোনো 3 meal/day নির্বাচন করা যাবে?**

3. ## Student কি booking করার পরে মাঝখান থেকে কোনো দিনের meal cancel করতে পারবে?

4. ## **Meal-এর টাকা আগে পুরো দিতে হবে, নাকি meal নেওয়ার সময়ও payment করা যাবে?**

5. ## একজন student কি একই দিনে Lunch নেবে কিন্তু Dinner নাও নিতে পারে?

6. ## Management team-এর একজন student কি নিজের জন্য meal register/payment/attendance edit করতে পারবে, নাকি অন্য operator-এর approval লাগবে?

## **এই ৬টার উত্তর খুব গুরুত্বপূর্ণ**, কারণ এগুলোর উপর database schema, calculation logic এবং UI flow নির্ভর করবে।

## আর একটি বিষয় আমি বিশেষভাবে recommend করব: **"Meal Booking" এবং "Meal Attendance" কখনো একই জিনিস হিসেবে রাখব না।** Booking মানে সে খাবার নেওয়ার জন্য registered; Attendance মানে সে বাস্তবে খাবার নিয়েছে। এই separation রাখলে পরবর্তীতে হিসাব অনেক বেশি নির্ভুল হবে।

* ## 

## 