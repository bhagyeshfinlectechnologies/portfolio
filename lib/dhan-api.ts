import axios, { AxiosInstance } from 'axios';

export interface DhanConfig {
  clientId: string;
  accessToken: string;
}

export interface Holding {
  securityId: string;
  tradingSymbol: string;
  exchangeSegment: string;
  isin: string;
  totalQty: number;
  dpQty: number;
  t1Qty: number;
  availableQty: number;
  collateralQty: number;
  avgCostPrice: number;
  buyAvg: number;
  buyQty: number;
  sellAvg: number;
  sellQty: number;
  lastTradedPrice: number;
  realizedProfit: number;
  unrealizedProfit: number;
  rbiReferenceRate: number;
  multiplier: number;
}

export interface Position {
  securityId: string;
  positionType: string;
  exchangeSegment: string;
  productType: string;
  tradingSymbol: string;
  buyAvg: number;
  buyQty: number;
  sellAvg: number;
  sellQty: number;
  netQty: number;
  realizedProfit: number;
  unrealizedProfit: number;
  rbiReferenceRate: number;
  multiplier: number;
  carryForwardBuyQty: number;
  carryForwardSellQty: number;
  carryForwardBuyValue: number;
  carryForwardSellValue: number;
  dayBuyQty: number;
  daySellQty: number;
  dayBuyValue: number;
  daySellValue: number;
  drvExpiryDate: string;
  drvOptionType: string;
  drvStrikePrice: number;
  crossCurrency: boolean;
  lastTradedPrice: number;
}

export interface Order {
  orderId: string;
  exchangeOrderId: string;
  correlationId: string;
  orderStatus: string;
  transactionType: string;
  exchangeSegment: string;
  productType: string;
  orderType: string;
  validity: string;
  tradingSymbol: string;
  securityId: string;
  quantity: number;
  disclosedQuantity: number;
  price: number;
  triggerPrice: number;
  afterMarketOrder: boolean;
  boProfitValue: number;
  boStopLossValue: number;
  legName: string;
  createTime: string;
  updateTime: string;
  exchangeTime: string;
  drvExpiryDate: string;
  drvOptionType: string;
  drvStrikePrice: number;
  omsErrorCode: string;
  omsErrorDescription: string;
  filled_qty: number;
  algoId: string;
  remarks: string;
}

export interface Fund {
  sodLimit: number;
  collateralAmount: number;
  availabelBalance: number;
  utilizedAmount: number;
  blockedPayinAmount: number;
  blockedPayoutAmount: number;
  withdrawableBalance: number;
}

export class DhanAPI {
  private client: AxiosInstance;
  private config: DhanConfig;

  constructor(config: DhanConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.dhan.co/v2',
      headers: {
        'Content-Type': 'application/json',
        'access-token': config.accessToken,
        'client-id': config.clientId,
      },
    });
  }

  async getHoldings(): Promise<Holding[]> {
    try {
      const response = await this.client.get('/holdings');
      return response.data;
    } catch (error) {
      console.error('Error fetching holdings:', error);
      throw error;
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.client.get('/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.client.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getFunds(): Promise<Fund> {
    try {
      const response = await this.client.get('/fundlimit');
      return response.data;
    } catch (error) {
      console.error('Error fetching funds:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async placeOrder(orderData: any): Promise<any> {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async modifyOrder(orderId: string, orderData: any): Promise<any> {
    try {
      const response = await this.client.put(`/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error modifying order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await this.client.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }
}

export function createDhanClient(config: DhanConfig): DhanAPI {
  return new DhanAPI(config);
}
