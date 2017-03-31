import React from "react";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import OrderActions from "../components/orderActions";
import * as Constants from "../../lib/constants";

function handleActionClick(filter) {
  Reaction.pushActionView({
    provides: "dashboard",
    template: "orders",
    data: {
      filter
    }
  });
}

function composer(props, onData) {
  const selectedFilterName = Reaction.getUserPreferences(Constants.PACKAGE_NAME, Constants.ORDER_LIST_FILTERS_PREFERENCE_NAME);
  let selectedIndex;

  Meteor.call("orders/count", (error, result) => {
    if (error) {
      throw new Meteor.Error("Error fetching order count", error);
    }

    const filters = Constants.orderFilters.map((filter, index) => {
      if (filter.name === selectedFilterName) {
        selectedIndex = index;
      }

      filter.label = i18next.t(`order.filter.${filter.name}`, { defaultValue: filter.label });
      filter.i18nKeyLabel = `order.filter.${filter.name}`;
      filter.count = 0;

      result.forEach((orderCount) => {
        if (orderCount._id.includes(filter.name)) {
          filter.count = orderCount.count;
        }
      });

      return filter;
    });

    onData(null, {
      filters,
      selectedIndex,

      onActionClick: props.onActionClick || handleActionClick
    });
  });
}

function OrdersActionContainer(props) {
  return (
    <OrderActions {...props} />
  );
}

export default composeWithTracker(composer, null)(OrdersActionContainer);
