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
    riskTh: "เดินขณะทางส่งปิดหรืออุดตัน (Deadhead), ความดันเกินพิกัด",
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
    // "พลังงานไหลย้อนกลับ" not "แรงดันย้อนกลับ": what comes back is power,
    // which shows up as DC-bus overvoltage on a drive — not a reversed voltage.
    riskTh: "พลังงานไหลย้อนกลับ, ความเร็วเกิน, เบรกไม่อยู่",
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
        nameTh: "เดินปั๊มขณะทางส่งปิดหรืออุดตัน (Deadhead)",
        // "มัก" is load-bearing. Radial-flow shut-off power is typically lower
        // than duty power, but how much lower is a property of the individual
        // pump curve — stating it as a law invites a setting copied onto a pump
        // where it does not hold.
        currentSignatureTh:
          "ปั๊มหอยโข่งแบบ Radial-flow **มักมี**กระแสและกำลัง**ลดลง**เมื่ออัตราการไหลเข้าใกล้ศูนย์ — ต้องยืนยันกับกราฟกำลังของรุ่นนั้นก่อน",
        fieldSymptomTh:
          "ไม่มีการไหลผ่านเพื่อพาความร้อนออก ของเหลวในเรือนปั๊มหมุนวนและรับพลังงานจากใบพัดต่อเนื่องจนอุณหภูมิสูงขึ้น ถ้าเดินค้างไว้นานอาจเกิดไอหรือเดือด ทำให้แมคคานิคอลซีลและชิ้นส่วนภายในเสียหาย",
        // Interlock first: the order these are listed in is the order they are
        // read as priority, and current is the weaker signal here.
        detection: ["external-sensor-interlock", "undercurrent"],
        caveatTh:
          "**อย่าใช้ Undercurrent เป็นด่านหลักของอาการนี้** — กระแสตอน Deadhead อาจอยู่ใกล้กับกระแสตอนโหลดต่ำตามปกติจนแยกไม่ออก และเปลี่ยนไปอีกเมื่อขับด้วย VFD ด่านหลักคือสวิตช์การไหล ความดันด้านส่ง หรืออุณหภูมิที่เรือนปั๊ม ร่วมกับ Minimum-flow Bypass ส่วน Undercurrent เป็นด่านเสริมที่ตั้งจากค่าที่วัดหน้างานจริงเท่านั้น อีกข้อคือทิศทางกระแสนี้ใช้ได้เฉพาะ Radial-flow — ปั๊ม Axial/Propeller และ Positive Displacement กระแสจะ **พุ่งขึ้น** เมื่อปิดปลายทาง ตรงกันข้ามกันโดยสิ้นเชิง",
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
        fn: "stall-locked-rotor",
        whenTh:
          "ปั๊มน้ำเสียหรือปั๊มที่มีเศษวัสดุพันใบพัดจนล็อกได้ (จึงมีใบพัดแบบ Chopper และ Vortex ขาย) — ปั๊มน้ำสะอาดทั่วไปไม่จำเป็น",
      },
      {
        fn: "external-sensor-interlock",
        whenTh:
          "ต้องกันเดินแห้งหรือ Deadhead อย่างแน่นอน — ใช้สวิตช์ระดับน้ำ สวิตช์การไหล ความดันด้านส่ง หรืออุณหภูมิเรือนปั๊ม และพิจารณา Minimum-flow Bypass ทั้งสองอาการนี้กระแสอย่างเดียวยืนยันไม่ได้",
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
        nameTh: "เดินปั๊มขณะทางส่งปิดหรือประตูน้ำปิด (Deadhead)",
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
  {
    // The third answer to "what happens when you close the discharge".
    // Rotodynamic pumps have a shut-off point on their curve; a positive
    // displacement machine has fixed displacement per revolution, so closing
    // the discharge does not reduce flow, it raises pressure — and power
    // follows the pressure ratio with nothing bounding it but the relief
    // valve. That is why external-sensor-interlock is REQUIRED here and only
    // conditional on the pumps.
    id: "screw-air-compressor",
    nameTh: "เครื่องอัดอากาศแบบสกรู",
    nameEn: "Rotary screw air compressor",
    loadType: "positive-displacement",
    failureModes: [
      {
        id: "blocked-discharge",
        nameTh: "ทางส่งปิดหรืออุดตัน",
        currentSignatureTh:
          "กระแส **สูงขึ้นตามความดันด้านส่ง** และ **ไม่มีจุดสูงสุดในตัวเอง** ต่างจากปั๊มที่กราฟกำลังมีเพดาน",
        fieldSymptomTh: "ความดันขึ้นเร็วผิดปกติ วาล์วนิรภัยระบาย เสียงและอุณหภูมิด้านส่งเปลี่ยนชัดเจน",
        detection: ["external-sensor-interlock", "overload"],
        caveatTh:
          "**รีเลย์กระแสไม่ใช่อุปกรณ์นิรภัยด้านความดัน** ด่านหลักคือวาล์วนิรภัยกับสวิตช์ความดัน และเมื่อวาล์วนิรภัยระบายเป็นจังหวะ กระแสจะขึ้น–ลงสลับจนอาจไม่ค้างสูงนานพอให้รีเลย์ทริปเลย",
      },
      {
        id: "separator-clogged",
        nameTh: "ไส้กรองแยกน้ำมันตัน (Separator ΔP)",
        currentSignatureTh:
          "กระแส **สูงขึ้น ทั้งที่เกจความดันในไลน์อ่านได้ปกติ** เพราะแอร์เอนด์ต้องอัดสูงกว่าไลน์เท่ากับ ΔP ที่คร่อมไส้กรอง",
        fieldSymptomTh: "ค่าไฟต่อลมที่ผลิตได้สูงขึ้นเรื่อย ๆ อุณหภูมิสูงขึ้น อาจมีน้ำมันหลุดไปกับลม",
        detection: ["overload", "external-sensor-interlock"],
        caveatTh:
          "เป็น “ทางส่งตันอยู่ข้างในเครื่อง” — ช่างดูเกจไลน์แล้วสรุปว่าปกติ ตัวชี้ขาดคือเกจ ΔP คร่อมไส้กรองแยก ไม่ใช่เกจไลน์",
      },
      {
        id: "inlet-filter-clogged",
        nameTh: "กรองอากาศขาเข้าตัน",
        currentSignatureTh:
          "กระแส **ลดลงเล็กน้อย** เพราะอากาศขาเข้าถูกหรี่ มวลอากาศต่อรอบจึงลดลง",
        fieldSymptomTh: "ลมที่ได้ต่อชั่วโมงลดลง เวลาเติมถังนานขึ้น สุญญากาศที่ด้านหน้ากรองสูงขึ้น",
        detection: ["external-sensor-interlock"],
        caveatTh:
          "**ทิศทางตรงข้ามกับไส้กรองแยกตัน** — จุดตันสองจุดในเครื่องเดียวกันให้กระแสคนละทาง และค่าที่เปลี่ยนอยู่ระดับไม่กี่เปอร์เซ็นต์ ซึ่งจมอยู่ในความแปรปรวนปกติ **จึงห้ามตั้ง Undercurrent เพื่อหวังจับอาการนี้**",
      },
      {
        id: "start-against-pressure",
        nameTh: "สตาร์ตขณะยังมีความดันค้าง (Blowdown ไม่ทำงาน)",
        currentSignatureTh: "กระแสสตาร์ตสูงค้างนานกว่าปกติมาก บางครั้งไม่เร่งขึ้นจนเข้าเขตมอเตอร์ค้าง",
        fieldSymptomTh: "สตาร์ตแล้วครางแต่ไม่ขึ้นรอบ มักเกิดเมื่อสั่งเดินใหม่เร็วเกินไปหลังเพิ่งหยุด",
        detection: ["start-delay", "stall-locked-rotor"],
        caveatTh:
          "**อย่าแก้ด้วยการยืด D-Time** เครื่องสกรูออกแบบให้สตาร์ตขณะไม่มีภาระ ถ้าเวลาเร่งยาวขึ้นแปลว่าวาล์วระบายความดันค้างหรือเวลาหยุดขั้นต่ำยังไม่ครบ",
      },
      {
        id: "drive-loss",
        nameTh: "คัปปลิ้งหรือสายพานขับขาด",
        currentSignatureTh: "กระแสตกลงสู่ระดับเดินตัวเปล่าและค้างอยู่",
        fieldSymptomTh: "มอเตอร์หมุนแต่ไม่มีลมออก ความดันในถังไม่ขึ้น",
        detection: ["undercurrent"],
        caveatTh:
          "**การควบคุมแบบโหลด–อันโหลดทำให้แยกไม่ออก** เพราะตอนอันโหลดกระแสก็ตกลงอยู่แล้ว ต้องอินฮิบิต Undercurrent ขณะอันโหลด หรือตั้งต่ำกว่ากระแสตอนอันโหลดแล้วยอมรับว่ามองไม่เห็นช่วงนั้น",
      },
      {
        id: "overheat-cooling",
        nameTh: "ระบายความร้อนไม่พอ (คูลเลอร์ตัน น้ำมันต่ำ ห้องอับ)",
        currentSignatureTh: "กระแส **แทบไม่เปลี่ยน** ความเสียหายเดินไปทางอุณหภูมิ ไม่ใช่ทางกระแส",
        fieldSymptomTh: "อุณหภูมิด้านส่งสูงขึ้น เครื่องตัดตัวเองด้วยเทอร์โมสตัท น้ำมันเสื่อมเร็ว",
        detection: ["external-sensor-interlock"],
        caveatTh:
          "รีเลย์กระแสไม่มีทางเห็นอาการนี้เลย สวิตช์อุณหภูมิของตัวเครื่องคือด่านเดียว และห้าม bypass เพื่อให้เดินต่อ",
      },
    ],
    required: ["overload", "phase-loss", "start-delay", "external-sensor-interlock"],
    recommended: ["unbalance", "stall-locked-rotor"],
    conditional: [
      {
        fn: "undercurrent",
        whenTh:
          "ต้องจับคัปปลิ้งหรือสายพานขาด และตั้งได้ต่ำกว่ากระแสตอนอันโหลดจริง หรืออินฮิบิตขณะอันโหลดได้",
      },
      {
        fn: "start-count",
        whenTh:
          "ควบคุมแบบสตาร์ต–หยุด หรือสั่งเดินเองหลังไฟดับ — จำกัดตามจำนวนครั้งต่อชั่วโมงและเวลาหยุดขั้นต่ำที่คู่มือกำหนด",
      },
      { fn: "ground-fault", whenTh: "ติดตั้งกลางแจ้ง ในห้องชื้น หรือมอเตอร์ที่เคยพันใหม่" },
    ],
    articleSlug: "screw-air-compressor-motor-protection",
    industries: [],
  },
  {
    // Same physics as the screw at the discharge, different physics inside the
    // measuring window: torque swings between near zero and a sharp peak
    // within every revolution, at a frequency slow enough to sit inside a
    // relay's RMS window. That is the whole reason this is a separate entry.
    id: "reciprocating-air-compressor",
    nameTh: "เครื่องอัดอากาศแบบลูกสูบ",
    nameEn: "Reciprocating (piston) air compressor",
    loadType: "pulsating",
    failureModes: [
      {
        id: "start-against-pressure",
        nameTh: "สตาร์ตขณะยังมีความดันค้างที่หัวสูบ",
        currentSignatureTh: "กระแสสตาร์ตสูงค้างนานผิดปกติ บางครั้งไม่เร่งขึ้นเลย",
        fieldSymptomTh: "สตาร์ตแล้วครางอยู่กับที่ พบบ่อยเมื่อวาล์วปลดภาระหรือเช็ควาล์วไม่ระบายความดัน",
        detection: ["stall-locked-rotor", "start-delay"],
        caveatTh:
          "แยกจาก “แรงดันตกที่ปลายสาย” ด้วยกระแสอย่างเดียวไม่ได้ ทั้งสองอย่างทำให้สตาร์ตไม่ขึ้นเหมือนกัน ต้องวัดแรงดันที่ขั้วมอเตอร์ขณะสตาร์ตประกอบเสมอ",
      },
      {
        id: "blocked-discharge",
        nameTh: "ทางส่งปิดหรืออุดตัน",
        currentSignatureTh:
          "กระแส **สูงขึ้น** และ **ค่ายอดต่อรอบสูงขึ้นเร็วกว่าค่า RMS**",
        fieldSymptomTh: "วาล์วนิรภัยระบายเป็นจังหวะ หัวสูบร้อนจัด เสียงเปลี่ยน",
        detection: ["external-sensor-interlock", "overload"],
        caveatTh:
          "เมื่อวาล์วนิรภัยระบายเป็นจังหวะ กระแสจะขึ้น–ลงสลับ **รีเลย์อาจไม่เคยเห็นค่าสูงค้างนานพอจะทริปเลย** ทั้งที่เครื่องกำลังเสียหาย ด่านที่ถูกคือสวิตช์ความดันกับวาล์วนิรภัย",
      },
      {
        id: "valve-plate-leak",
        nameTh: "ลิ้น/แผ่นวาล์วรั่ว หรือปะเก็นฝาสูบแตก",
        currentSignatureTh: "กระแส **ลดลง** เพราะงานที่ทำได้ต่อรอบลดลง ทั้งที่เครื่องกำลังเสีย",
        fieldSymptomTh: "เวลาเติมถังนานขึ้นมาก หัวสูบร้อนผิดปกติ ลมที่ได้ต่อชั่วโมงตก",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "**อาการเสียที่ทำให้กระแส “ดูดีขึ้น”** ค่า Undercurrent ที่ตั้งไว้จับสายพานขาดจะต่ำเกินกว่าจะเห็น ตัวชี้ขาดคือเวลาเติมถังเทียบกับตอนเครื่องยังดี และอุณหภูมิหัวสูบ",
      },
      {
        id: "belt-slip-break",
        nameTh: "สายพานลื่นหรือขาด",
        currentSignatureTh: "ลื่น: กระแสต่ำกว่าที่ควรเป็น · ขาด: ตกสู่ระดับเดินตัวเปล่าทันที",
        fieldSymptomTh: "มีเสียงลื่นและฝุ่นยาง ล้อช่วยแรงหมุนช้ากว่าปกติ หรือไม่หมุนเลย",
        detection: ["undercurrent"],
        caveatTh:
          "สายพานลื่น วาล์วรั่ว และการเดินตอนปลดภาระ ให้กระแสต่ำเหมือนกันหมด แยกได้จากความเร็วล้อช่วยแรงและเวลาเติมถัง ไม่ใช่จากค่ากระแส",
      },
      {
        id: "short-cycling",
        nameTh: "สตาร์ต–หยุดถี่เกิน (ถังเล็ก ระบบรั่ว ช่วงความดันแคบ)",
        currentSignatureTh: "กระแสตอนเดินปกติดี แต่มีช่วงกระแสสตาร์ตซ้ำถี่ตลอดกะ",
        fieldSymptomTh: "เครื่องตัด–ต่อทุกไม่กี่นาที มอเตอร์ร้อนสะสมทั้งที่ไม่เคยทริป",
        detection: ["start-count"],
        caveatTh:
          "แบบจำลองความร้อนของ Overload มองไม่เห็น เพราะระหว่างรอบกระแสกลับมาปกติหมด ความร้อนมาจากกระแสสตาร์ตซ้ำ ๆ ที่โรเตอร์ และต้นเหตุจริงมักคือรอยรั่วในระบบลมหรือถังเล็กเกิน",
      },
      {
        id: "uneven-pulsation",
        nameTh: "แรงบิดเต้นรุนแรงผิดปกติ (สูบทำงานไม่เท่ากัน ล้อช่วยแรงหลวม)",
        currentSignatureTh:
          "กระแสเต้นตามรอบข้อเหวี่ยงลึกกว่าเดิม และค่ารายเฟสอ่านได้ต่างกันชั่วขณะ **ทั้งที่แหล่งจ่ายสมดุลดี**",
        fieldSymptomTh: "สั่นแรงขึ้น ฐานแท่นคลอน เสียงเครื่องไม่สม่ำเสมอ",
        detection: ["unbalance", "external-sensor-interlock"],
        caveatTh:
          "**ก่อนสรุปว่าไฟไม่สมดุล ต้องแยกให้ออกก่อนว่าเป็นแรงบิดเต้นหรือไม่** — เดินตอนปลดภาระ หรือถอดสายพานแล้วเดินมอเตอร์เปล่า แล้วอ่านซ้ำ ถ้าเป็นปัญหาฝั่งไฟจะยังอยู่ ถ้าเป็นภาพหลอกจากแรงบิดจะหายไป และต้องวัดแรงดันสามเฟสประกอบเสมอ",
      },
    ],
    required: ["overload", "phase-loss", "start-delay", "external-sensor-interlock"],
    recommended: ["start-count", "unbalance", "stall-locked-rotor"],
    conditional: [
      {
        fn: "undercurrent",
        whenTh:
          "ขับด้วยสายพานและต้องจับสายพานขาด — ตั้งได้เฉพาะเมื่อกระแสเดินปกติกับตอนปลดภาระห่างกันพอ",
      },
      { fn: "ground-fault", whenTh: "ติดตั้งกลางแจ้ง ในที่ชื้น หรือมอเตอร์เก่า/พันใหม่" },
    ],
    articleSlug: "reciprocating-air-compressor-motor-protection",
    industries: [],
  },
  {
    // The machine where "how high" tells you nothing and "how long" tells you
    // everything: a normal feed peak and the first instant of a real jam are
    // the same current. And when the mechanical fuse does its job, current
    // goes DOWN while the chamber is packed solid.
    id: "crusher-mill",
    nameTh: "เครื่องบด / เครื่องย่อย",
    nameEn: "Crusher / hammer mill",
    loadType: "shock",
    failureModes: [
      {
        id: "jam-stall",
        nameTh: "ติดค้างจริง (ของแข็งเข้าเครื่อง)",
        currentSignatureTh:
          "กระแสพุ่งขึ้นแล้ว **ค้างสูง ไม่กลับลงมาเอง** และความเร็วไม่คืนตัว",
        fieldSymptomTh: "เครื่องหยุดหรือหมุนช้าลงชัดเจน มีเสียงผิดปกติและกลิ่นไหม้จากสายพานขับ",
        detection: ["stall-locked-rotor", "overload"],
        caveatTh:
          "**ในวินาทีแรกเหมือนกระแสกระชากตามปกติทุกประการ** สิ่งเดียวที่แยกได้จากกระแสคือ “นานแค่ไหน” ไม่ใช่ “สูงแค่ไหน” จึงต้องยอมให้มีหน่วงเวลาสั้น ๆ ก่อนตัด ตัวที่แยกได้ทันทีคือสวิตช์ความเร็วที่เพลาเครื่องบด",
      },
      {
        id: "mechanical-fuse-slip",
        nameTh: "ฟิวส์ทางกลทำงาน (สายพานวีลื่น โทเกิลเพลตหัก สลักเฉือนขาด วาล์วปลดแรงดัน)",
        currentSignatureTh:
          "กระแส **ตกลง ทั้งที่เครื่องกำลังติดค้าง** เพราะมอเตอร์หมุนอยู่แต่ไม่ได้ขับอะไรแล้ว",
        fieldSymptomTh: "ห้องบดเต็มแน่นแต่มอเตอร์เดินเบา มีควันหรือกลิ่นไหม้จากสายพาน",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "**กรณีที่ Overload และ Stall มองไม่เห็นอะไรเลย** เพราะกระแสลด ไม่ได้เพิ่ม และ Undercurrent เองก็แยก “ฟิวส์ทางกลทำงาน” ออกจาก “ช่วงไม่มีวัตถุดิบป้อน” ไม่ได้ ต้องใช้สวิตช์ความเร็ว",
      },
      {
        id: "start-into-choked-chamber",
        nameTh: "สตาร์ตขณะมีวัสดุค้างในห้องบด",
        currentSignatureTh: "กระแสสตาร์ตสูงและยาวกว่าสตาร์ตตัวเปล่ามาก อาจไม่พ้นช่วงเร่งเลย",
        fieldSymptomTh: "สตาร์ตไม่ขึ้นหลังหยุดฉุกเฉินหรือหลังไฟดับขณะยังป้อนวัสดุอยู่",
        detection: ["start-delay", "stall-locked-rotor"],
        caveatTh:
          "**ทางแก้คือเคลียร์ห้องบด ไม่ใช่ยืด D-Time** — D-Time ที่ยาวขึ้นคือช่วงเวลาที่ Stall ไม่ทำงาน จึงเป็นการเปิดช่องให้มอเตอร์ค้างได้นานขึ้น",
      },
      {
        id: "overfeed-choke",
        nameTh: "ป้อนวัสดุมากเกิน (Choke feed)",
        currentSignatureTh: "กระแสสูงต่อเนื่องแต่ยังหมุนอยู่ ความเร็วต่ำกว่าปกติเล็กน้อย",
        fieldSymptomTh: "วัสดุล้นปากป้อน ผลผลิตหยาบขึ้น มอเตอร์ร้อนสะสม",
        detection: ["overload", "external-sensor-interlock"],
      },
      {
        id: "worn-hammers-liners",
        nameTh: "ค้อน ไลเนอร์ หรือฟันบดสึก",
        currentSignatureTh:
          "กระแสฐาน **ค่อย ๆ ลดลงเป็นสัปดาห์ถึงเดือน** พร้อมผลผลิตที่หยาบขึ้น",
        fieldSymptomTh: "ต้องบดซ้ำมากขึ้น ขนาดผลผลิตไม่ผ่านสเปก กำลังผลิตต่อชั่วโมงลด",
        detection: ["undercurrent", "external-sensor-interlock"],
        caveatTh:
          "เป็นแนวโน้มที่ช้าเกินกว่าจะทำเป็นค่าทริป **อย่าตั้ง Undercurrent ให้ตัดจากเรื่องนี้** ใช้เป็นข้อมูลวางแผนบำรุงรักษาแทน โดยจดกระแสฐานตอนใส่ค้อนใหม่ไว้เป็นค่าอ้างอิง",
      },
      {
        id: "ground-fault-dust",
        nameTh: "ไฟรั่วลงดินจากฝุ่นและแรงสั่นสะเทือน",
        currentSignatureTh: "กระแสสามเฟสอาจปกติ แต่ผลรวมผ่าน ZCT ไม่เป็นศูนย์",
        fieldSymptomTh: "ค่าความเป็นฉนวนลดลง มักเริ่มที่จุดสายเข้ามอเตอร์ซึ่งถูกสั่นจนเปื่อย",
        detection: ["ground-fault"],
      },
    ],
    required: ["overload", "stall-locked-rotor", "start-delay", "phase-loss"],
    recommended: ["ground-fault", "unbalance", "undercurrent"],
    conditional: [
      {
        fn: "external-sensor-interlock",
        whenTh:
          "ต้องมีสวิตช์ความเร็วที่เพลาเครื่องบด อินเตอร์ล็อกกับเครื่องป้อน และสวิตช์ความสั่นสะเทือน โดยเฉพาะเครื่องที่ขับด้วยสายพานวีหรือมีสลักเฉือน ซึ่งเวลาติดค้างกระแสจะลด ไม่ใช่เพิ่ม",
      },
      {
        fn: "start-count",
        whenTh:
          "เครื่องที่ถูกสั่งเดิน–หยุดบ่อย เช่น โรงโม่เคลื่อนที่ — ล้อช่วยแรงทำให้การสตาร์ตแต่ละครั้งมีต้นทุนความร้อนสูง",
      },
    ],
    articleSlug: "crusher-hammer-mill-motor-protection",
    industries: [],
  },
  {
    // The one machine on this list where the most dangerous failure produces
    // no current signal at all. A slipping brake drops the load while the
    // motor is not even energised.
    //
    // NOTE: undercurrent is deliberately absent from every tier and every
    // detection list. Low current during a normal lower is correct behaviour,
    // not a fault, and listing the function would make the Selector recommend
    // exactly what the article spends a section forbidding.
    id: "hoist-crane",
    nameTh: "รอก / เครน",
    nameEn: "Hoist / crane",
    loadType: "overhauling",
    failureModes: [
      {
        id: "lowering-regenerative",
        nameTh: "ลดโหลดลง — โหลดขับมอเตอร์กลับ",
        currentSignatureTh:
          "กระแส **ต่ำกว่าตอนยกที่น้ำหนักเท่ากัน** แต่ไม่เป็นศูนย์ และ **ไม่แปรตามน้ำหนักโหลด** เพราะทิศทางของกำลังกลับด้าน ส่วนรีเลย์อ่านได้แค่ขนาด",
        fieldSymptomTh: "เป็นการทำงานปกติ ไม่ใช่ความผิดปกติ — แต่เป็นภาพที่ทำให้อ่านค่าผิดบ่อยที่สุด",
        detection: ["external-sensor-interlock"],
        caveatTh:
          "**ห้ามตั้ง Undercurrent ให้แปลว่า “โหลดหาย” บนรอก** กระแสต่ำตอนลดโหลดคือพฤติกรรมปกติ และถ้าเป็นรอก VFD ที่ทิ้งพลังงานลงเบรกรีซิสเตอร์ กระแสด้านไลน์จะยิ่งต่ำทั้งที่มอเตอร์ทำงานเต็มแรงบิด — **ตำแหน่งที่คล้อง CT เปลี่ยนคำตอบทั้งหมด**",
      },
      {
        id: "brake-slip",
        nameTh: "เบรกลื่นหรือผ้าเบรกสึก — โหลดไหลลงเอง",
        currentSignatureTh:
          "**ไม่มีสัญญาณใด ๆ ในกระแสเลย** เพราะโหลดไหลลงตอนที่มอเตอร์ไม่ได้จ่ายไฟอยู่ด้วยซ้ำ",
        fieldSymptomTh: "โหลดค่อย ๆ ไหลลงหลังปล่อยปุ่ม ระยะเบรกยาวขึ้น มีเสียงและกลิ่นผ้าเบรก",
        detection: ["external-sensor-interlock"],
        caveatTh:
          "**อาการที่อันตรายที่สุดของรอก คืออาการที่รีเลย์กระแสมองไม่เห็นเลย** สิ่งที่กันได้คือเบรกแบบสปริงกด–ไฟฟ้าปลด สวิตช์ยืนยันการปลดและจับเบรก การวัดผ้าเบรกและระยะห่างตามรอบ และการทดสอบด้วยน้ำหนักตามกฎหมาย",
      },
      {
        id: "overload-lifting",
        nameTh: "ยกเกินพิกัด",
        currentSignatureTh:
          "กระแสตอนยกสูงขึ้น และถ้ายกไม่ขึ้นจะกลายเป็นกระแสค้างระดับมอเตอร์ค้าง",
        fieldSymptomTh: "ยกไม่ขึ้นหรือขึ้นช้าผิดปกติ โครงสร้างและรอกมีเสียงลั่น",
        detection: ["overload", "stall-locked-rotor"],
        caveatTh:
          "**กระแสไม่ใช่เครื่องชั่ง** ที่ความเร็วต่ำ ตอนกระตุกทีละนิด และบนรอก VFD กระแสไม่แปรตามน้ำหนักอย่างที่คิด อุปกรณ์จำกัดน้ำหนักจริงคือโหลดเซลล์หรือคลัตช์จำกัดแรงบิด ไม่ใช่รีเลย์",
      },
      {
        id: "brake-not-released",
        nameTh: "เบรกไม่ปลดแล้วสั่งเดิน",
        currentSignatureTh: "กระแสค้างที่ระดับมอเตอร์ค้าง โดยที่โหลดไม่ขยับ",
        fieldSymptomTh: "มอเตอร์ครางอยู่กับที่ ผ้าเบรกไหม้ คอยล์เบรกร้อนจัด",
        detection: ["stall-locked-rotor", "overload"],
        caveatTh:
          "เป็นหนึ่งในไม่กี่อาการของชุดเบรกที่กระแสเห็นชัด แต่เบรกที่ “ปลดไม่หมด” จะลากไปเงียบ ๆ โดยกระแสขึ้นไม่มากพอให้ทริป จึงยังต้องมีสวิตช์ยืนยันการปลดอยู่ดี",
      },
      {
        id: "collector-contact-loss",
        nameTh: "หน้าสัมผัสรางไฟหรือสายเฟสตองหลุดชั่วขณะ",
        currentSignatureTh:
          "กระแสเฟสหนึ่งหายเป็นช่วงสั้น ๆ อีกสองเฟสสูงขึ้นชั่วขณะ ค่าไม่สมดุลกระพริบไปมา",
        fieldSymptomTh: "คนใช้งานรายงานว่า “รอกไม่มีแรง” หรือสะดุดเป็นช่วง มักสัมพันธ์กับตำแหน่งบนราง",
        detection: ["phase-loss", "unbalance"],
        caveatTh:
          "อาการเป็นแบบชั่วขณะ **ถ้าตั้งหน่วงเวลายาวเกินจะไม่เห็นเลย** และจะถูกรายงานเป็นปัญหาทางกลแทนที่จะเป็นปัญหาทางไฟฟ้า",
      },
      {
        id: "ground-fault-trailing-cable",
        nameTh: "ไฟรั่วที่สายลากหรือรางไฟ",
        currentSignatureTh: "กระแสสามเฟสอาจปกติ แต่ผลรวมผ่าน ZCT ไม่เป็นศูนย์",
        fieldSymptomTh: "สายลากถูกดึงและเสียดสีจนฉนวนเปื่อย มักพบที่จุดงอซ้ำ ๆ และที่ปลายทางเข้า",
        detection: ["ground-fault"],
      },
    ],
    required: ["overload", "phase-loss", "start-count", "external-sensor-interlock"],
    recommended: ["stall-locked-rotor", "unbalance", "ground-fault"],
    conditional: [
      {
        fn: "start-delay",
        whenTh:
          "ใช้ซอฟต์สตาร์ตหรือรอกสองความเร็วที่ช่วงเร่งยาว — ตั้งสั้นที่สุดเท่าที่สตาร์ตขึ้น เพราะช่วง D-Time คือช่วงที่ Stall ไม่ทำงาน",
      },
    ],
    articleSlug: "hoist-crane-motor-protection",
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

  // Anything named as a detection method must also be named as a function to
  // fit. Section E says "ตรวจจับด้วย X" and Section F is the list of what to
  // buy — a function in the first and not the second tells the reader to use
  // something the same page never tells them to install.
  //
  // centrifugal-pump shipped exactly that: clogging was detected by
  // stall-locked-rotor, which appeared in none of its tiers.
  //
  // The reverse is NOT checked, and must not be: a tier entry with no matching
  // failure-mode row is legitimate and deliberate. unbalance on the pumps and
  // start-count on the hoist mean "fit this because the failure is real",
  // whether or not the table happens to enumerate it.
  const inTiers = new Set<ProtectionFunction>(tiers);
  for (const fm of e.failureModes) {
    for (const fn of fm.detection) {
      if (!inTiers.has(fn)) {
        throw new Error(
          `driven-equipment: "${e.id}/${fm.id}" is detected by "${fn}", but "${fn}" is in no tier — ` +
            `section E would render a chip that section F never tells the reader to fit`
        );
      }
    }
  }
}
