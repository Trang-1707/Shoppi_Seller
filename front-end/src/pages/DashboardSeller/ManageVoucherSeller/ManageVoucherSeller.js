import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import VoucherList from "./VoucherList";

const ManageVoucherSeller = () => {
  const { handleSetDashboardTitle } = useOutletContext();

  useEffect(() => {
    handleSetDashboardTitle("Voucher Management");
  }, [handleSetDashboardTitle]);

  return <VoucherList />;
};

export default ManageVoucherSeller;
