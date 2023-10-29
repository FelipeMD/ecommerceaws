export enum CatalogEventType {
    CREATED = "PRODUCT_CREATED",
    UPDATED = "PRODUCT_UPDATED",
    DELETED = "PRODUCT_DELETED"
}

export interface CatalogEvent {
    requestId: string;
    eventType: CatalogEventType;
    productId: string;
    productCode: string;
    productPrice: number;
    email: string;
}