import { categoryBySlug } from "./series";

// ============================================================================
// SINGLE SOURCE OF TRUTH for load behaviour, failure modes and which
// protection function catches which failure.
//
// Two things read this file and they must never disagree:
//   1. Article bodies — <FailureModes> and <ProtectionMatrix> render sections
//      E and F of the standard template from here at BUILD time, so no article
//      hand-writes a failure table.
//   2. The Motor Application & Protection Selector — reads the same rows at
//      RUNTIME to answer "I have this equipment, what do I need".
//
// Writing the engineering once is the whole point. If a failure mode is
// discovered on a job, it is corrected here and every article that references
// the equipment picks it up on the next build.
//
// Honesty rules that this data must keep (see docs and the article template):
//   - A current signature is a SIGNAL, never a diagnosis. Low current does not
//     always mean dry run; high current does not always mean motor fault.
//   - Where current alone cannot distinguish a failure, say so and require an
//     external sensor rather than implying the relay can see it.
// ============================================================================

/** The ten load behaviours. Every driven equipment maps to exactly one. */
export type LoadType =
  | "variable-torque"
  | "constant-torque"
  | "positive-displacement"
  | "high-inertia"
  | "shock"
  | "pulsating"
  | "cyclic"
  | "overhauling"
  | "constant-power"
  | "low-load-detectable";

export const LOAD_TYPES: Record<
  LoadType,
  { nameTh: string; behaviourTh: string; riskTh: string }
> = {
  "variable-torque": {
    nameTh: "Variable Torque",
    behaviourTh: "แรงบิดและกำลังเปลี่ยนตามความเร็ว (T ∝ n², P ∝ n³ โดยประมาณ)",
    riskTh: "โหลดเกิน, เดินแห้ง, คาวิเทชัน",
  },
  "constant-torque": {
    nameTh: "Constant Torque",
    behaviourTh: "ต้องการแรงบิดใกล้เคียงเดิมตลอดช่วงความเร็ว",
    riskTh: "ติดขัด, สายพานเสียหาย, โหลดเกิน",
  },
  "positive-displacement": {
    nameTh: "Positive Displacement",
    behaviourTh: "อัตราการไหลผูกกับความเร็วโดยตรง ไม่ขึ้นกับความดันปลายทาง",
    riskTh: "เดินตันปลายทาง (Deadhead), ความดันเกินพิกัด",
  },
  "high-inertia": {
    nameTh: "High Inertia",
    behaviourTh: "ค่าโมเมนต์ความเฉื่อยสูง ใช้เวลาเร่งจนถึงความเร็วพิกัดนาน",
    riskTh: "ทริปตอนสตาร์ต, ความร้อนสะสมในโรเตอร์ระหว่างเร่ง",
  },
  shock: {
    nameTh: "Shock Load",
    behaviourTh: "กระแสกระชากเป็นช่วงตามจังหวะที่วัตถุดิบเข้าเครื่อง",
    riskTh: "ติดขัด, แรงกระแทกทางกล",
  },
  pulsating: {
    nameTh: "Pulsating Load",
    behaviourTh: "แรงบิดไม่สม่ำเสมอภายในหนึ่งรอบการหมุน",
    riskTh: "สั่นสะเทือน, กระแสยอดสูงกว่าค่าเฉลี่ยมาก",
  },
  cyclic: {
    nameTh: "Cyclic / Intermittent",
    behaviourTh: "สตาร์ต–หยุดบ่อยตามรอบการทำงาน",
    riskTh: "ความร้อนสะสมจากจำนวนครั้งที่สตาร์ต",
  },
  overhauling: {
    nameTh: "Overhauling Load",
    behaviourTh: "โหลดขับมอเตอร์กลับ มอเตอร์กลายเป็นเครื่องกำเนิดชั่วขณะ",
    riskTh: "แรงดันย้อนกลับ, ความเร็วเกิน, เบรกไม่อยู่",
  },
  "constant-power": {
    nameTh: "Constant Power",
    behaviourTh: "แรงบิดลดลงเมื่อความเร็วเพิ่ม กำลังคงที่",
    riskTh: "ความเร็วเกิน, ไดรฟ์รับภาระเกิน",
  },
  "low-load-detectable": {
    nameTh: "Low-load Detectable",
    behaviourTh: "เมื่อเกิดความผิดปกติบางชนิด โหลดจะ 'หายไป' แทนที่จะเพิ่ม",
    riskTh: "เดินแห้ง, สายพานขาด, ใบพัดหลุด",
  },
};

/** Protection functions a relay can provide, or that need an external sensor. */
export type ProtectionFunction =
  | "overload"
  | "stall-locked-rotor"
  | "start-delay"
  | "phase-loss"
  | "unbalance"
  | "undercurrent"
  | "ground-fault"
  | "start-count"
  | "external-sensor-interlock";

export const PROTECTION_FUNCTIONS: Record<
  ProtectionFunction,
  { nameTh: string; whatItDoesTh: string; productSeries: string[] }
> = {
  overload: {
    nameTh: "Overload (โหลดเกิน)",
    whatItDoesTh: "ตัดวงจรเมื่อกระแสสูงกว่าค่าที่ตั้งไว้นานเกินเวลาหน่วง",
    productSeries: ["eocr-ss-se2", "eocr-3d-3e", "eocr-i3-digital"],
  },
  "stall-locked-rotor": {
    nameTh: "Stall / Locked Rotor (มอเตอร์ค้าง)",
    whatItDoesTh: "ตัดเร็วเมื่อกระแสค้างสูงมากขณะที่มอเตอร์ควรหมุนแล้ว",
    productSeries: ["eocr-ss-se2", "eocr-i3-digital"],
  },
  "start-delay": {
    nameTh: "Start Delay / D-Time",
    whatItDoesTh: "ไม่นับกระแสช่วงสตาร์ตเป็นโหลดเกิน จนพ้นเวลาเร่ง",
    productSeries: ["eocr-ss-se2", "eocr-i3-digital"],
  },
  "phase-loss": {
    nameTh: "Phase Loss (ขาดเฟส)",
    whatItDoesTh: "ตัดเมื่อเฟสใดเฟสหนึ่งหายไป ก่อนอีกสองเฟสรับภาระแทนจนไหม้",
    productSeries: ["eocr-3d-3e", "eocr-i3-digital", "eocr-phase-voltage"],
  },
  unbalance: {
    nameTh: "Current Unbalance (กระแสไม่สมดุล)",
    whatItDoesTh: "ตัดเมื่อส่วนต่างระหว่างเฟสสูงสุดกับต่ำสุดเกินค่าที่ตั้ง",
    productSeries: ["eocr-3d-3e", "eocr-i3-digital"],
  },
  undercurrent: {
    nameTh: "Undercurrent / Underload (กระแสต่ำ)",
    whatItDoesTh: "ตัดเมื่อกระแสต่ำกว่าค่าที่ตั้ง — โหลดหายไปทั้งที่มอเตอร์ยังหมุน",
    productSeries: ["eucr-under-current", "eocr-i3-digital"],
  },
  "ground-fault": {
    nameTh: "Ground Fault (ไฟรั่วลงดิน)",
    whatItDoesTh: "ตรวจผลรวมกระแสสามเฟสผ่าน ZCT — ไม่เป็นศูนย์คือมีกระแสรั่วลงดิน",
    productSeries: ["eocr-if-ground-fault", "zct-ct"],
  },
  "start-count": {
    nameTh: "Start Count / Duty Cycle",
    whatItDoesTh: "จำกัดจำนวนครั้งที่สตาร์ตต่อชั่วโมง ป้องกันความร้อนสะสม",
    productSeries: ["eocr-i3-digital", "isem-communication"],
  },
  "external-sensor-interlock": {
    nameTh: "Interlock จากเซนเซอร์ภายนอก",
    whatItDoesTh:
      "อาการที่กระแสมอเตอร์มองไม่เห็น ต้องใช้เซนเซอร์ภายนอก เช่น สวิตช์ระดับน้ำ ความดัน การไหล หรือความเร็วสายพาน ต่อพ่วงเข้าวงจรควบคุม",
    // Deliberately empty: this is a wiring requirement, not a product line.
    productSeries: [],
  },
};

export type FailureMode = {
  id: string;
  nameTh: string;
  /** What the motor current actually does. A signal, never a diagnosis. */
  currentSignatureTh: string;
  fieldSymptomTh: string;
  detection: ProtectionFunction[];
  /** Set when current alone genuinely cannot separate this from something else. */
  caveatTh?: string;
};

export type DrivenEquipment = {
  id: string;
  nameTh: string;
  nameEn: string;
  loadType: LoadType;
  failureModes: FailureMode[];
  required: ProtectionFunction[];
  recommended: ProtectionFunction[];
  conditional: { fn: ProtectionFunction; whenTh: string }[];
  /** Filled in as the L-page for this equipment publishes. */
  articleSlug?: string;
  /** Industry article slugs that reference it — drives generated back-links. */
  industries: string[];
};

export const DRIVEN_EQUIPMENT: DrivenEquipment[] = [
  {
    id: "centrifugal-pump",
    nameTh: "ปั๊มหอยโข่ง",
    nameEn: "Centrifugal pump",
    loadType: "variable-torque",
    failureModes: [
      {
        id: "dry-run",
        nameTh: "เดินแห้ง (Dry Run)",
        currentSignatureTh: "กระแสตกลงต่ำกว่าค่าปกติอย่างชัดเจนและค้างอยู่",
        fieldSymptomTh: "ปั๊มหมุนแต่ไม่มีน้ำออก ตัวเรือนร้อน แมคคานิคอลซีลไหม้",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "กระแสต่ำไม่ได้แปลว่าเดินแห้งเสมอไป วาล์วด้านส่งปิดในปั๊มหอยโข่งก็ทำให้กระแสต่ำเช่นกัน ต้องดูร่วมกับระดับน้ำหรือการไหล",
      },
      {
        id: "cavitation",
        nameTh: "คาวิเทชัน (Cavitation)",
        currentSignatureTh: "กระแสแกว่งไม่นิ่ง มักต่ำกว่าปกติเล็กน้อย",
        fieldSymptomTh: "เสียงเหมือนกรวดหมุนในเรือนปั๊ม สั่น ใบพัดกร่อนเป็นรูพรุน",
        detection: ["external-sensor-interlock"],
        caveatTh:
          "รีเลย์กระแสตรวจคาวิเทชันได้ไม่น่าเชื่อถือ ต้องดู NPSH ที่มีจริงเทียบกับที่ปั๊มต้องการ และวัดความดันด้านดูด",
      },
      {
        id: "clogging",
        nameTh: "อุดตัน (Clogging / Ragging)",
        currentSignatureTh: "กระแสค่อย ๆ สูงขึ้นเข้าใกล้หรือเกินพิกัด",
        fieldSymptomTh: "อัตราการไหลลด ปั๊มร้อน อาจได้ยินเสียงผิดปกติ",
        detection: ["overload", "stall-locked-rotor"],
      },
      {
        id: "deadhead",
        nameTh: "เดินตันปลายทาง (Deadhead)",
        currentSignatureTh: "ปั๊มหอยโข่ง — กระแส **ลดลง** เมื่อวาล์วด้านส่งปิด",
        fieldSymptomTh: "ไม่มีการไหล ของเหลวในเรือนปั๊มร้อนขึ้นเรื่อย ๆ จนเดือด",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "ใช้ได้เฉพาะปั๊มหอยโข่ง (Radial) เท่านั้น — ปั๊มใบพัดตามแนวแกน (Axial/Propeller) และปั๊ม Positive Displacement กระแสจะ **พุ่งขึ้น** เมื่อปิดปลายทาง ตรงกันข้ามกันโดยสิ้นเชิง ห้ามนำค่าที่ตั้งไว้กับปั๊มแบบหนึ่งไปใช้กับอีกแบบ",
      },
      {
        id: "ground-fault-wet",
        nameTh: "ไฟรั่วลงดินในบ่อเปียก",
        currentSignatureTh: "กระแสสามเฟสอาจปกติ แต่ผลรวมผ่าน ZCT ไม่เป็นศูนย์",
        fieldSymptomTh: "เบรกเกอร์ต้นทางทริป หรือรู้สึกไฟดูดที่โครงโลหะ",
        detection: ["ground-fault"],
      },
      {
        id: "reverse-rotation",
        nameTh: "หมุนกลับทาง",
        currentSignatureTh: "กระแสต่ำกว่าที่ควรเป็นที่ภาระเดียวกัน",
        fieldSymptomTh: "แรงดันและอัตราการไหลได้ไม่ถึงพิกัด มักพบหลังซ่อมหรือย้ายสาย",
        detection: ["undercurrent", "phase-loss"],
        caveatTh: "ยืนยันด้วยการวัดลำดับเฟส ไม่ใช่จากกระแสอย่างเดียว",
      },
    ],
    required: ["overload", "phase-loss"],
    recommended: ["undercurrent", "unbalance", "ground-fault"],
    conditional: [
      { fn: "start-delay", whenTh: "ท่อยาวหรือใช้เวลาไล่อากาศนานตอนสตาร์ต" },
      {
        fn: "external-sensor-interlock",
        whenTh: "ต้องกันเดินแห้งอย่างแน่นอน — ใช้สวิตช์ระดับน้ำหรือสวิตช์การไหลร่วมด้วย",
      },
    ],
    articleSlug: "centrifugal-pump-motor-protection",
    industries: ["water-pumping-motor-protection"],
  },
  {
    id: "axial-propeller-pump",
    nameTh: "ปั๊มใบพัดตามแนวแกน (Axial / Propeller)",
    nameEn: "Axial-flow / propeller pump",
    loadType: "variable-torque",
    failureModes: [
      {
        id: "deadhead",
        nameTh: "เดินตันปลายทาง / ประตูน้ำปิด",
        currentSignatureTh:
          "กระแส **พุ่งขึ้น** เมื่อการไหลลดลง — สูงสุดที่จุดปิดสนิท (Shut-off)",
        fieldSymptomTh: "มอเตอร์ร้อนเร็ว อาจทริปภายในไม่กี่นาที เสียงและแรงสั่นเปลี่ยนชัดเจน",
        detection: ["overload", "external-sensor-interlock"],
        caveatTh:
          "ตรงข้ามกับปั๊มหอยโข่งโดยสิ้นเชิง — ปั๊มหอยโข่งกระแสจะลดลงเมื่อปิดปลายทาง แต่ปั๊มแนวแกนกระแสจะสูงสุด จึงห้ามสตาร์ตปั๊มแนวแกนโดยปิดประตูน้ำไว้ (ซึ่งเป็นวิธีที่ใช้ได้กับปั๊มหอยโข่ง)",
      },
      {
        id: "low-sump-level",
        nameTh: "ระดับน้ำในบ่อต่ำเกิน",
        currentSignatureTh: "กระแสลดลงและแกว่ง เพราะใบพัดเริ่มดูดอากาศ",
        fieldSymptomTh:
          "เสียงดังผิดปกติ สั่นแรง และในปั๊มจุ่มคือสูญเสียการระบายความร้อนของมอเตอร์ทันที",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "ในปั๊มจุ่ม มอเตอร์อาศัยน้ำรอบตัวเป็นตัวระบายความร้อน ระดับน้ำต่ำจึงเป็นเรื่องความร้อนก่อนจะเป็นเรื่องการไหล ต้องใช้สวิตช์ระดับน้ำตัดการทำงาน ไม่ใช่รอให้รีเลย์กระแสตรวจเจอ",
      },
      {
        id: "trash-blockage",
        nameTh: "ตะแกรงหน้าปั๊มอุดตัน (ขยะ/ผักตบ)",
        currentSignatureTh: "กระแสค่อย ๆ สูงขึ้นตามการไหลที่ลดลง",
        fieldSymptomTh: "ระดับน้ำด้านหน้าตะแกรงสูงขึ้นแต่ระบายไม่ทัน",
        detection: ["overload", "external-sensor-interlock"],
      },
      {
        id: "ground-fault-wet",
        nameTh: "ไฟรั่วลงดินในบ่อสูบ",
        currentSignatureTh: "กระแสสามเฟสอาจปกติ แต่ผลรวมผ่าน ZCT ไม่เป็นศูนย์",
        fieldSymptomTh: "ค่าความเป็นฉนวนลดลง มักเริ่มจากรอยต่อสายเคเบิลหรือซีลที่รั่ว",
        detection: ["ground-fault"],
        caveatTh:
          "ปั๊มจุ่มจมอยู่ในน้ำตลอดเวลา การป้องกันไฟรั่วลงดินจึงไม่ใช่ของเสริม และควรวัดค่าความเป็นฉนวนตามรอบ ไม่ใช่รอให้รีเลย์ทำงาน",
      },
      {
        id: "reverse-rotation",
        nameTh: "หมุนกลับทาง",
        currentSignatureTh: "กระแสต่ำกว่าที่ควรเป็น และการไหลลดลงมาก",
        fieldSymptomTh: "ระบายน้ำได้น้อยผิดปกติ พบบ่อยหลังถอดซ่อมหรือสลับสายเมน",
        detection: ["phase-loss", "undercurrent"],
        caveatTh: "ยืนยันด้วยการวัดลำดับเฟส ไม่ใช่จากกระแสอย่างเดียว",
      },
      {
        id: "long-cable-vdrop",
        nameTh: "แรงดันตกในสายเคเบิลที่ยาว",
        currentSignatureTh: "กระแสสูงกว่าที่คาดที่ภาระเดิม และสูงไม่เท่ากันทั้งสามเฟส",
        fieldSymptomTh: "สตาร์ตยาก มอเตอร์ร้อนกว่าปกติ โดยเฉพาะบ่อลึกหรือสายเดินไกล",
        detection: ["unbalance", "overload"],
      },
    ],
    required: ["overload", "phase-loss", "ground-fault", "external-sensor-interlock"],
    recommended: ["unbalance", "undercurrent", "start-delay"],
    conditional: [
      {
        fn: "start-count",
        whenTh: "สถานีที่สั่งเดิน–หยุดตามระดับน้ำบ่อย ต้องจำกัดจำนวนครั้งที่สตาร์ตต่อชั่วโมง",
      },
    ],
    articleSlug: "axial-propeller-pump-motor-protection",
    industries: [],
  },
  {
    id: "centrifugal-fan",
    nameTh: "พัดลม / โบลเวอร์",
    nameEn: "Centrifugal fan / blower",
    loadType: "variable-torque",
    failureModes: [
      {
        id: "broken-belt",
        nameTh: "สายพานขาดหรือหลุด",
        currentSignatureTh: "กระแสตกลงทันทีสู่ระดับเดินตัวเปล่า",
        fieldSymptomTh: "มอเตอร์หมุนแต่ไม่มีลม อุณหภูมิปลายทางสูงขึ้น",
        detection: ["undercurrent"],
      },
      {
        id: "excess-airflow",
        nameTh: "ลมไหลมากเกิน (แดมเปอร์เปิดสุด / ท่อยังไม่ต่อ)",
        currentSignatureTh:
          "กระแสสูงเกินพิกัด — เฉพาะพัดลมแบบ Forward-curved ที่กำลังเพิ่มขึ้นเรื่อย ๆ ตามปริมาณลม",
        fieldSymptomTh: "ทริปหลังเปิดแดมเปอร์สุด หรือตอนทดลองเดินก่อนต่อท่อ ระบบต้านทานต่ำกว่าที่ออกแบบ",
        detection: ["overload", "start-delay"],
        caveatTh:
          "ขึ้นกับชนิดใบพัด — Forward-curved เป็นแบบ Overloading กำลังเพิ่มต่อเนื่องจนถึงจุดลมออกอิสระ จึงทริปได้จริง ส่วน Backward-curved และ Airfoil เป็นแบบ Non-overloading กำลังขึ้นสูงสุดใกล้จุด BEP แล้วลดลง เปิดแดมเปอร์สุดจึงไม่ทำให้โหลดเกินในลักษณะเดียวกัน ต้องดูชนิดใบพัดก่อนสรุป",
      },
      {
        id: "blocked-inlet",
        nameTh: "ทางลมเข้าอุดตัน / ฟิลเตอร์ตัน",
        currentSignatureTh: "กระแส **ลดลง** เพราะมวลอากาศที่เคลื่อนย้ายลดลง",
        fieldSymptomTh: "ลมออกน้อย ความดันสถิตเปลี่ยน ห้องอับ",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "อาการเดียวกับสายพานขาดเมื่อดูจากกระแสอย่างเดียว ต้องดูความดันต่างคร่อมฟิลเตอร์ประกอบ",
      },
      {
        id: "long-acceleration",
        nameTh: "เร่งตัวนาน (ความเฉื่อยสูง)",
        currentSignatureTh: "กระแสสูงค้างตลอดช่วงสตาร์ต นานกว่ามอเตอร์ทั่วไปมาก",
        fieldSymptomTh: "ทริปตอนสตาร์ตทั้งที่เดินแล้วปกติ",
        detection: ["start-delay", "overload"],
      },
      {
        id: "impeller-imbalance",
        nameTh: "ใบพัดไม่สมดุล / มีคราบเกาะ",
        currentSignatureTh: "กระแสแกว่งเล็กน้อยรอบค่าปกติ",
        fieldSymptomTh: "สั่นสะเทือนเพิ่มขึ้น แบริ่งเสียงดัง อายุแบริ่งสั้นลง",
        detection: ["external-sensor-interlock"],
        caveatTh: "ตรวจด้วยการวัดความสั่นสะเทือน กระแสมอเตอร์ไม่ไวพอสำหรับอาการนี้",
      },
    ],
    required: ["overload", "phase-loss", "start-delay"],
    recommended: ["undercurrent", "unbalance"],
    conditional: [
      { fn: "ground-fault", whenTh: "ติดตั้งกลางแจ้งหรือในพื้นที่ชื้น" },
      { fn: "external-sensor-interlock", whenTh: "ต้องแยกฟิลเตอร์ตันออกจากสายพานขาด" },
    ],
    articleSlug: "fan-blower-motor-protection",
    industries: [],
  },
  {
    id: "belt-conveyor",
    nameTh: "สายพานลำเลียง",
    nameEn: "Belt conveyor",
    loadType: "constant-torque",
    failureModes: [
      {
        id: "jam",
        nameTh: "ติดขัด / วัตถุดิบอุดตัน",
        currentSignatureTh: "กระแสพุ่งขึ้นและค้างสูง ไม่ลดลงเอง",
        fieldSymptomTh: "สายพานหยุดหรือเคลื่อนช้าลง มีเสียงลื่นหรือกลิ่นไหม้",
        detection: ["stall-locked-rotor", "overload"],
      },
      {
        id: "broken-belt",
        nameTh: "สายพานขาด",
        currentSignatureTh: "กระแสตกลงทันทีสู่ระดับเดินตัวเปล่า",
        fieldSymptomTh: "มอเตอร์และลูกกลิ้งหมุนแต่ไม่มีวัสดุเคลื่อนที่",
        detection: ["undercurrent"],
      },
      {
        id: "belt-slip",
        nameTh: "สายพานลื่น",
        currentSignatureTh: "กระแสต่ำกว่าที่ควรเป็นเมื่อเทียบกับปริมาณวัสดุที่ป้อน",
        fieldSymptomTh: "ผลผลิตปลายสายลดลง ลูกกลิ้งขับร้อน ผิวสายพานสึก",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh: "ยืนยันด้วยสวิตช์วัดความเร็วสายพาน กระแสอย่างเดียวแยกจากโหลดเบาไม่ได้",
      },
      {
        id: "overfeed",
        nameTh: "ป้อนวัสดุมากเกิน",
        currentSignatureTh: "กระแสสูงต่อเนื่องแต่ยังหมุนอยู่",
        fieldSymptomTh: "วัสดุล้นข้างสายพาน มอเตอร์ร้อนสะสม",
        detection: ["overload"],
      },
      {
        id: "start-under-load",
        nameTh: "สตาร์ตขณะมีวัสดุเต็มสาย",
        currentSignatureTh: "กระแสสตาร์ตสูงและยาวนานกว่าปกติ",
        fieldSymptomTh: "ทริปตอนสตาร์ตหลังหยุดฉุกเฉินขณะสายพานยังเต็ม",
        detection: ["start-delay", "stall-locked-rotor"],
      },
    ],
    required: ["overload", "stall-locked-rotor", "phase-loss"],
    recommended: ["undercurrent", "start-delay"],
    conditional: [
      {
        fn: "external-sensor-interlock",
        whenTh: "ต้องมีสวิตช์ความเร็วสายพานหรือสายดึงหยุดฉุกเฉินตามข้อกำหนดความปลอดภัย",
      },
      { fn: "ground-fault", whenTh: "ติดตั้งกลางแจ้ง ในที่ชื้น หรือมีฝุ่นนำไฟฟ้า" },
    ],
    articleSlug: "belt-conveyor-motor-protection",
    industries: [],
  },
];

const BY_ID = new Map(DRIVEN_EQUIPMENT.map((e) => [e.id, e]));

export function equipmentById(id: string): DrivenEquipment | undefined {
  return BY_ID.get(id);
}

// ---------------------------------------------------------------------------
// Anchor ids.
//
// Other pages link at a section of an article rather than the top of it — the
// selector sends a reader to the exact failure mode it just named, and product
// pages link at the protection matrix. Those strings are built here so a link
// and its target can never be written differently in two places.
//
// Row ids carry the equipment id as well as the failure mode id because
// "dry-run" and "reverse-rotation" repeat across equipment: an article showing
// two tables would otherwise emit the same id twice and the browser would
// scroll to whichever came first.
// ---------------------------------------------------------------------------
export const FAILURE_MODES_ANCHOR = "failure-modes";
export const PROTECTION_MATRIX_ANCHOR = "protection-matrix";

export function failureModeAnchor(equipmentId: string, failureModeId: string): string {
  return `fm-${equipmentId}-${failureModeId}`;
}

/** Deep link straight at one failure-mode row, e.g. from the selector. */
export function failureModeHref(e: DrivenEquipment, failureModeId: string): string | undefined {
  if (!e.articleSlug) return undefined;
  return `/learn/${e.articleSlug}/#${failureModeAnchor(e.id, failureModeId)}`;
}

/** Every protection function an equipment names, deduplicated, in tier order. */
export function functionsFor(e: DrivenEquipment): ProtectionFunction[] {
  const seen = new Set<ProtectionFunction>();
  return [...e.required, ...e.recommended, ...e.conditional.map((c) => c.fn)].filter(
    (f) => !seen.has(f) && seen.add(f)
  );
}

// ---------------------------------------------------------------------------
// Build-time integrity. These throw during `next build`, which is the point:
// a dead product link or an unknown function id in a spec table is exactly the
// kind of error that is invisible in review and embarrassing in production.
// ---------------------------------------------------------------------------
for (const [fn, def] of Object.entries(PROTECTION_FUNCTIONS)) {
  for (const slug of def.productSeries) {
    if (!categoryBySlug(slug)) {
      throw new Error(
        `driven-equipment: protection function "${fn}" points at unknown category slug "${slug}"`
      );
    }
  }
}

for (const e of DRIVEN_EQUIPMENT) {
  const ids = new Set<string>();
  for (const fm of e.failureModes) {
    if (ids.has(fm.id)) {
      throw new Error(`driven-equipment: duplicate failure mode "${fm.id}" on "${e.id}"`);
    }
    ids.add(fm.id);
    if (fm.detection.length === 0) {
      throw new Error(
        `driven-equipment: failure mode "${e.id}/${fm.id}" lists no detection method`
      );
    }
  }
  const tiers = [...e.required, ...e.recommended, ...e.conditional.map((c) => c.fn)];
  const dupes = tiers.filter((f, i) => tiers.indexOf(f) !== i);
  if (dupes.length) {
    throw new Error(
      `driven-equipment: "${e.id}" lists ${dupes[0]} in more than one tier — pick required, recommended or conditional`
    );
  }
}
