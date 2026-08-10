/** "13"=MTN, "6"=Telecel, "7"=AirtelTigo — per Moolre's documented channel codes. */
export type MoolreChannel = "13" | "6" | "7";

export type InitiatePaymentSuccess = {
  status: 1;
  code: "TR099";
  data: string; // Moolre transaction id
};

export type InitiatePaymentOtpRequired = {
  status: 1;
  code: "TP14";
  message: string;
};

export type InitiatePaymentError = {
  status: 0 | "0";
  code: string;
  message: string;
};

export type InitiatePaymentResponse =
  | InitiatePaymentSuccess
  | InitiatePaymentOtpRequired
  | InitiatePaymentError;

export type PaymentStatusData = {
  txstatus: number;
  txtype: number;
  accountnumber: string;
  payer: string;
  payee: string;
  amount: string;
  value: string;
  transactionid: string;
  externalref: string;
  thirdpartyref: string;
  ts: string;
};

export type PaymentStatusResponse = {
  status: number;
  code: string;
  message: string;
  data: PaymentStatusData | null;
};
