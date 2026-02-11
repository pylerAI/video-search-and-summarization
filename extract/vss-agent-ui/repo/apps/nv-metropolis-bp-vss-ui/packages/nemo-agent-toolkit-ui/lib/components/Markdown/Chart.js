import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Import html-to-image for generating images
import { IconDownload } from "@tabler/icons-react";
import React, { useContext } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
// Import dynamic from Next.js
import HomeContext from "../../pages/api/home/home.context";
import * as htmlToImage from "html-to-image";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from "recharts";
// Dynamically import the ForceGraph2D component with SSR disabled
const ForceGraph2D = dynamic(()=>import("react-force-graph-2d"), {
    ssr: false
});
// Utility function to generate a random color
const getRandomColor = ()=>{
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
const Chart = (props)=>{
    const data = props?.payload;
    const { Label = '', ChartType = '', Data = [], XAxisKey = '', YAxisKey = '', ValueKey = '', NameKey = '', PolarAngleKey = '', PolarValueKey = '', BarKey = '', LineKey = '', Nodes = [], Links = [] } = data;
    const { state: { selectedConversation, conversations }, dispatch } = useContext(HomeContext);
    const colors = {
        fill: '#76b900',
        stroke: 'black'
    };
    const handleDownload = async ()=>{
        try {
            const chartElement = document.getElementById(`chart-${Label}`);
            if (chartElement) {
                console.log('Generating image to download...');
                const chartBackground = chartElement.style.background;
                // Set the chart background to white before capturing the image
                chartElement.style.background = 'white';
                // Capture the image
                const dataUrl = await htmlToImage.toPng(chartElement);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${Label}-${ChartType}.png`;
                link.click();
                // Reset the chart background
                chartElement.style.background = chartBackground;
                console.log('Image downloaded successfully.');
                toast.success('Downloaded successfully.');
            }
        } catch (error) {
            console.error('Error generating download image:', error);
        }
    };
    const renderChart = ()=>{
        switch(ChartType){
            case 'BarChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(BarChart, {
                        id: `chart-BarChart-${Label}`,
                        data: Data,
                        children: [
                            /*#__PURE__*/ _jsx(CartesianGrid, {
                                strokeDasharray: "3 3"
                            }),
                            /*#__PURE__*/ _jsx(XAxis, {
                                dataKey: XAxisKey
                            }),
                            /*#__PURE__*/ _jsx(YAxis, {}),
                            /*#__PURE__*/ _jsx(Tooltip, {}),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Bar, {
                                dataKey: YAxisKey,
                                fill: colors.fill
                            })
                        ]
                    })
                });
            case 'LineChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(LineChart, {
                        id: `chart-LineChart-${Label}`,
                        data: Data,
                        children: [
                            /*#__PURE__*/ _jsx(CartesianGrid, {
                                strokeDasharray: "3 3"
                            }),
                            /*#__PURE__*/ _jsx(XAxis, {
                                dataKey: XAxisKey
                            }),
                            /*#__PURE__*/ _jsx(YAxis, {}),
                            /*#__PURE__*/ _jsx(Tooltip, {}),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Line, {
                                type: "monotone",
                                dataKey: YAxisKey,
                                stroke: colors.fill
                            })
                        ]
                    })
                });
            case 'PieChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(PieChart, {
                        id: `chart-PieChart-${Label}`,
                        children: [
                            /*#__PURE__*/ _jsx(Tooltip, {}),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Pie, {
                                data: Data,
                                dataKey: ValueKey,
                                nameKey: NameKey,
                                fill: colors.fill,
                                label: true,
                                children: Data.map((entry, index)=>/*#__PURE__*/ _jsx(Cell, {
                                        fill: getRandomColor()
                                    }, `cell-${index}`))
                            })
                        ]
                    })
                });
            case 'AreaChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(AreaChart, {
                        id: `chart-AreaChart-${Label}`,
                        data: Data,
                        children: [
                            /*#__PURE__*/ _jsx(CartesianGrid, {
                                strokeDasharray: "3 3"
                            }),
                            /*#__PURE__*/ _jsx(XAxis, {
                                dataKey: XAxisKey
                            }),
                            /*#__PURE__*/ _jsx(YAxis, {}),
                            /*#__PURE__*/ _jsx(Tooltip, {}),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Area, {
                                type: "monotone",
                                dataKey: YAxisKey,
                                stroke: colors.stroke,
                                fill: colors.fill
                            })
                        ]
                    })
                });
            case 'RadarChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(RadarChart, {
                        id: `chart-RadarChart-${Label}`,
                        data: Data,
                        children: [
                            /*#__PURE__*/ _jsx(PolarGrid, {}),
                            /*#__PURE__*/ _jsx(PolarAngleAxis, {
                                dataKey: PolarAngleKey
                            }),
                            /*#__PURE__*/ _jsx(PolarRadiusAxis, {}),
                            /*#__PURE__*/ _jsx(Radar, {
                                name: "Metrics",
                                dataKey: PolarValueKey,
                                stroke: colors.stroke,
                                fill: colors.fill,
                                fillOpacity: 0.6
                            }),
                            /*#__PURE__*/ _jsx(Legend, {})
                        ]
                    })
                });
            case 'ScatterChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(ScatterChart, {
                        id: `chart-ScatterChart-${Label}`,
                        children: [
                            /*#__PURE__*/ _jsx(CartesianGrid, {}),
                            /*#__PURE__*/ _jsx(XAxis, {
                                type: "number",
                                dataKey: XAxisKey,
                                name: XAxisKey
                            }),
                            /*#__PURE__*/ _jsx(YAxis, {
                                type: "number",
                                dataKey: YAxisKey,
                                name: YAxisKey
                            }),
                            /*#__PURE__*/ _jsx(Tooltip, {
                                cursor: {
                                    strokeDasharray: '3 3'
                                }
                            }),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Scatter, {
                                name: "Sales vs Profit",
                                data: Data,
                                fill: colors.fill
                            })
                        ]
                    })
                });
            case 'ComposedChart':
                return /*#__PURE__*/ _jsx(ResponsiveContainer, {
                    width: "100%",
                    height: 300,
                    className: 'p-2',
                    children: /*#__PURE__*/ _jsxs(ComposedChart, {
                        id: `chart-ComposedChart-${Label}`,
                        data: Data,
                        children: [
                            /*#__PURE__*/ _jsx(CartesianGrid, {
                                strokeDasharray: "3 3"
                            }),
                            /*#__PURE__*/ _jsx(XAxis, {
                                dataKey: XAxisKey
                            }),
                            /*#__PURE__*/ _jsx(YAxis, {}),
                            /*#__PURE__*/ _jsx(Tooltip, {}),
                            /*#__PURE__*/ _jsx(Legend, {}),
                            /*#__PURE__*/ _jsx(Bar, {
                                dataKey: BarKey,
                                fill: colors.fill
                            }),
                            /*#__PURE__*/ _jsx(Line, {
                                type: "monotone",
                                dataKey: LineKey,
                                stroke: colors.stroke
                            })
                        ]
                    })
                });
            case 'GraphPlot':
                return /*#__PURE__*/ _jsx("div", {
                    style: {
                        width: '100%',
                        height: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px'
                    },
                    children: /*#__PURE__*/ _jsx(ForceGraph2D, {
                        id: `chart-GraphPlot-${Label}`,
                        graphData: {
                            nodes: Nodes.map((node)=>({
                                    id: node.id,
                                    name: node.label
                                })),
                            links: Links.map((link)=>({
                                    source: link.source,
                                    target: link.target,
                                    label: link.label
                                }))
                        },
                        nodeLabel: "name",
                        linkLabel: "label",
                        nodeAutoColorBy: "id",
                        width: window.innerWidth * 0.9,
                        height: 500
                    })
                });
            default:
                return /*#__PURE__*/ _jsx("div", {
                    children: "No chart type found"
                });
        }
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "pb-2",
        children: [
            /*#__PURE__*/ _jsx(IconDownload, {
                className: "w-4 h-4 hover:text-[#76b900] absolute top-[4.5rem] right-[4.5rem]",
                onClick: handleDownload
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "pt-4",
                id: `chart-${Label}`,
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "pl-4",
                        children: Label
                    }),
                    renderChart()
                ]
            })
        ]
    });
};
export default Chart;

//# sourceMappingURL=Chart.js.map