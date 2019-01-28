/// <reference path="highcharts-react-official.d.ts" />

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import createDataFeed, { IOrderBook } from "./DataFeed";
import { Subscription, Observable } from "rxjs";

const chartOptions = (title: string) => {
  return {
    chart: {
      type: "area",
      zoomType: "xy",
    },
    title: {
      text: `${title} Market Depth`,
    },
    xAxis: {
      minPadding: 0,
      maxPadding: 0,
      plotLines: [
        {
          color: "#888",
          value: 0.1523,
          width: 1,
          label: {
            text: "Actual price",
            rotation: 90,
          },
        },
      ],
      title: {
        text: "Price",
      },
    },
    yAxis: [
      {
        lineWidth: 1,
        gridLineWidth: 1,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        labels: {
          align: "left",
          x: 8,
        },
      },
      {
        opposite: true,
        linkedTo: 0,
        lineWidth: 1,
        gridLineWidth: 0,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        labels: {
          align: "right",
          x: -8,
        },
      },
    ],
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.2,
        lineWidth: 1,
        step: "center",
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size=10px;">Price: {point.key}</span><br/>',
      valueDecimals: 2,
    },
  };
};

interface IChartProps {
  Symbol: string;
}

export class Chart extends React.Component<IChartProps, IOrderBook> {
  constructor(props: IChartProps) {
    super(props);
    this.state = { Asks: [], Bids: [], Symbol: "" };
  }

  private subscription?: Subscription;

  public componentDidMount() {
    this.subscription = createDataFeed(this.props.Symbol).subscribe(
      (d: IOrderBook) => this.setState(d)
    );
  }

  public UNSAFE_componentWillReceiveProps(newProps: IChartProps) {
    if (this.props.Symbol != newProps.Symbol) {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = createDataFeed(newProps.Symbol).subscribe(
          (d: IOrderBook) => this.setState(d)
        );
      }
    }
  }

  public componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  public render() {
    const asks = this.state.Asks.map(([a, p]) => [a, p]);
    const bids = this.state.Bids.map(([a, p]) => [a, p]);

    const defaultOptions = chartOptions(this.state.Symbol);

    const options = {
      ...defaultOptions,
      series: [
        { data: asks, name: "asks", color: "#fc5857" },
        { data: bids, name: "bids", color: "#03a7a8" },
      ],
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
}