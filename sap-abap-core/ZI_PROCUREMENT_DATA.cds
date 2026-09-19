@AbapCatalog.sqlViewName: 'ZAIIPROCUREMENT'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Core Interface CDS View for Procurement Data'
define view ZAI_I_PROCUREMENT_DATA
  as select from zai_po_header as Header
  left outer join zai_goods_rec   as Receipt on Header.po_id = Receipt.po_id
  left outer join zai_vendor_score as Vendor  on Header.vendor_id = Vendor.vendor_id
{
  key Header.po_id         as PurchaseOrder,
      Header.vendor_id     as VendorID,
      Vendor.vendor_name   as VendorName,
      Header.po_date       as PurchaseOrderDate,
      Header.expected_date as ExpectedDeliveryDate,
      Receipt.gr_date      as ActualDeliveryDate,
      Header.status        as POStatus,
      Header.total_amount  as TotalAmount,
      Header.currency      as Currency,
      
      /* Calculated Field: Delivery Delay in Days */
      dats_days_between(Header.expected_date, Receipt.gr_date) as DelayDays,
      
      /* Risk Evaluation */
      case Header.status
        when 'DELAYED' then 'HIGH_RISK'
        else 'LOW'
      end                  as RiskCategory
}
