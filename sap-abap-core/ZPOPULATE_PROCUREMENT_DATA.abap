*======================================================================*
* Project: SAP S/4HANA AI Procurement System
* Report: ZPOPULATE_PROCUREMENT_DATA
* Purpose: Insert test procurement records into ZAI tables
*======================================================================*
REPORT zpopulate_procurement_data.

START-OF-SELECTION.

  " 1. Clear existing data
  DELETE FROM zai_po_header.
  DELETE FROM zai_po_item.
  DELETE FROM zai_goods_rec.
  DELETE FROM zai_vendor_score.

  " 2. Populate PO Header Table (zai_po_header)
  INSERT zai_po_header FROM TABLE @( VALUE #(
    ( client = sy-mandt po_id = '45000101' vendor_id = 'V001' po_date = '20260801' expected_date = '20260810' actual_date = '20260811' status = 'DELIVERED' total_amount = '14500.00' currency = 'USD' created_by = sy-uname created_at = sy-uzeit )
    ( client = sy-mandt po_id = '45000102' vendor_id = 'V002' po_date = '20260803' expected_date = '20260812' actual_date = '20260812' status = 'DELIVERED' total_amount = '16250.00' currency = 'USD' created_by = sy-uname created_at = sy-uzeit )
    ( client = sy-mandt po_id = '45000103' vendor_id = 'V003' po_date = '20260805' expected_date = '20260815' actual_date = '20260822' status = 'DELAYED'   total_amount = '34000.00' currency = 'USD' created_by = sy-uname created_at = sy-uzeit )
    ( client = sy-mandt po_id = '45000104' vendor_id = 'V003' po_date = '20260810' expected_date = '20260820' actual_date = '20260828' status = 'DELAYED'   total_amount = '29000.00' currency = 'USD' created_by = sy-uname created_at = sy-uzeit )
    ( client = sy-mandt po_id = '45000105' vendor_id = 'V004' po_date = '20260812' expected_date = '20260818' actual_date = '20260818' status = 'DELIVERED' total_amount = '8400.00'  currency = 'USD' created_by = sy-uname created_at = sy-uzeit )
  ) ).

  " 3. Populate Goods Receipt Table (zai_goods_rec)
  INSERT zai_goods_rec FROM TABLE @( VALUE #(
    ( client = sy-mandt gr_id = '50000801' po_id = '45000101' gr_date = '20260811' received_qty = '100' received_by = 'M_SMITH'  remarks = 'Customs clearance 1 day delay' )
    ( client = sy-mandt gr_id = '50000802' po_id = '45000102' gr_date = '20260812' received_qty = '500' received_by = 'J_DOE'    remarks = 'On-time delivery passed QA' )
    ( client = sy-mandt gr_id = '50000803' po_id = '45000103' gr_date = '20260822' received_qty = '50'  received_by = 'R_WILSON' remarks = '7-day port congestion delay' )
    ( client = sy-mandt gr_id = '50000804' po_id = '45000104' gr_date = '20260828' received_qty = '200' received_by = 'R_WILSON' remarks = 'Raw material shortage 8 days' )
    ( client = sy-mandt gr_id = '50000805' po_id = '45000105' gr_date = '20260818' received_qty = '2000' received_by = 'A_GARCIA' remarks = 'On schedule' )
  ) ).

  " 4. Populate Vendor Scorecard Table (zai_vendor_score)
  INSERT zai_vendor_score FROM TABLE @( VALUE #(
    ( client = sy-mandt vendor_id = 'V001' vendor_name = 'Apex Industrial Supplies Ltd.'    total_po = 1 delayed_po = 0 avg_delay_days = '1.00' ontime_delivery_pct = '100.00' performance_score = '95.00' risk_level = 'LOW'       last_evaluated = sy-datum )
    ( client = sy-mandt vendor_id = 'V002' vendor_name = 'Precision Tech Components'        total_po = 1 delayed_po = 0 avg_delay_days = '0.00' ontime_delivery_pct = '100.00' performance_score = '98.00' risk_level = 'LOW'       last_evaluated = sy-datum )
    ( client = sy-mandt vendor_id = 'V003' vendor_name = 'Global Logistics & Steel Corp'     total_po = 2 delayed_po = 2 avg_delay_days = '7.50' ontime_delivery_pct = '0.00'   performance_score = '55.00' risk_level = 'HIGH'      last_evaluated = sy-datum )
    ( client = sy-mandt vendor_id = 'V004' vendor_name = 'Titan Packaging Systems'          total_po = 1 delayed_po = 0 avg_delay_days = '0.00' ontime_delivery_pct = '100.00' performance_score = '96.00' risk_level = 'LOW'       last_evaluated = sy-datum )
  ) ).

  WRITE: / 'SUCCESS: Sample Procurement Records Inserted into SAP Tables!'.
