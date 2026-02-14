
import { Sale, SaleStatus, LogisticStatus, LineStatus, ProductType, OriginMarket, Notification, Comment, Seller } from './types';

const ADVISORS = ['Juan Pérez', 'Elena Blanco', 'Carlos Ruiz', 'Sofía Vega', 'David Sanz', 'Lucía Méndez'];
const SUPERVISORS = ['Marta García', 'Alberto Gómez'];
const PLANS = ['GIGA_MAX 50GB', 'BASICO 10GB', 'PREMIUM ILIMITADO', 'BAF 300MB', 'FIBRA 1GB'];
const PROMOTIONS = ['DESCUENTO 50% 12M', 'BONO BIENVENIDA', 'SIN PROMO', 'DUPLICA GIGAS', 'KIDS PACK'];
const OPERATORS = ['Movistar', 'Vodafone', 'Orange', 'Yoigo', 'Digi', 'Pepephone'];

const getRandomDate = () => {
  const start = new Date(2024, 3, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

export const MOCK_SELLERS: Seller[] = ADVISORS.map((name, i) => ({
  legajo: `L-${1000 + i}`,
  exa: `EXA-${500 + i}`,
  name: name,
  email: `${name.toLowerCase().replace(' ', '.')}@florhub.com`,
  dni: `${Math.floor(10000000 + Math.random() * 90000000)}${String.fromCharCode(65 + i)}`,
  supervisor: SUPERVISORS[i % SUPERVISORS.length],
  status: Math.random() > 0.1 ? 'ACTIVO' : 'INACTIVO'
}));

// Ventas sincronizadas con MOCK_SALES_DETAIL (mocks/ventasDetalle.ts)
// Estas ventas tienen IDs que coinciden con los detalles completos
export const MOCK_SALES: Sale[] = [
  {
    id: 'V-11000',
    customerName: 'Juan García',
    dni: '38475621',
    phoneNumber: '+54 11 7392-1847',
    status: SaleStatus.ACTIVADO,
    logisticStatus: LogisticStatus.ENTREGADO,
    lineStatus: LineStatus.ACTIVA,
    productType: ProductType.PORTABILITY,
    originMarket: OriginMarket.CONTRAFACTURA,
    originCompany: 'Movistar',
    plan: 'GigaMax Ilimitada',
    promotion: '50% OFF 12 Meses',
    priority: 'ALTA',
    date: '2024-11-27',
    amount: 8999,
    comments: [],
    advisor: 'Clark Kent',
    supervisor: 'Alberto Gómez'
  },
  {
    id: 'V-11001',
    customerName: 'María Rodríguez',
    dni: '42159876',
    phoneNumber: '+54 11 6147-8293',
    status: SaleStatus.EN_PROCESO,
    logisticStatus: LogisticStatus.ASIGNADO,
    lineStatus: LineStatus.PENDIENTE_PRECARGA,
    productType: ProductType.NEW_LINE,
    originMarket: OriginMarket.PREPAGO,
    originCompany: undefined,
    plan: 'Power 50GB',
    promotion: 'Línea Nueva 25% OFF',
    priority: 'MEDIA',
    date: '2024-11-15',
    amount: 6999,
    comments: [],
    advisor: 'Tony Stark',
    supervisor: 'Carolina López'
  }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'CRITICAL', title: 'Pieza Extraviada', message: 'La portabilidad V-10242 requiere atención inmediata por logística.', timestamp: 'Hace 2 min' },
  { id: 'n2', type: 'RECENT', title: 'Carga Masiva Exitosa', message: 'Se han importado 15 nuevos registros al HUB.', timestamp: 'Hace 10 min' }
];
