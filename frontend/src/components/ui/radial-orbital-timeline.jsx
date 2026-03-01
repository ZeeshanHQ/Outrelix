"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export default function RadialOrbitalTimeline({
    timelineData,
}) {
    const [expandedItems, setExpandedItems] = useState(
        {}
    );
    const [viewMode, setViewMode] = useState("orbital");
    const [rotationAngle, setRotationAngle] = useState(0);
    const [autoRotate, setAutoRotate] = useState(true);
    const [pulseEffect, setPulseEffect] = useState({});
    const [centerOffset, setCenterOffset] = useState({
        x: 0,
        y: 0,
    });
    const [activeNodeId, setActiveNodeId] = useState(null);
    const containerRef = useRef(null);
    const orbitRef = useRef(null);
    const nodeRefs = useRef({});

    const handleContainerClick = (e) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
        }
    };

    const toggleItem = (id) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (parseInt(key) !== id) {
                    newState[parseInt(key)] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                setActiveNodeId(id);
                setAutoRotate(false);

                const relatedItems = getRelatedItems(id);
                const newPulseEffect = {};
                relatedItems.forEach((relId) => {
                    newPulseEffect[relId] = true;
                });
                setPulseEffect(newPulseEffect);

                centerViewOnNode(id);
            } else {
                setActiveNodeId(null);
                setAutoRotate(true);
                setPulseEffect({});
            }

            return newState;
        });
    };

    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            if (autoRotate && viewMode === "orbital") {
                setRotationAngle((prev) => {
                    const newAngle = (prev + 0.3) % 360;
                    return Number(newAngle.toFixed(3));
                });
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        if (autoRotate && viewMode === "orbital") {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [autoRotate, viewMode]);

    const centerViewOnNode = (nodeId) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        setRotationAngle(270 - targetAngle);
    };

    const calculateNodePosition = (index, total) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 200;
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian) + centerOffset.x;
        const y = radius * Math.sin(radian) + centerOffset.y;

        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(
            0.4,
            Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
        );

        return { x, y, angle, zIndex, opacity };
    };

    const getRelatedItems = (itemId) => {
        const currentItem = timelineData.find((item) => item.id === itemId);
        return currentItem ? currentItem.relatedIds : [];
    };

    const isRelatedToActive = (itemId) => {
        if (!activeNodeId) return false;
        const relatedItems = getRelatedItems(activeNodeId);
        return relatedItems.includes(itemId);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "completed":
                return "text-white bg-black border-white";
            case "in-progress":
                return "text-black bg-white border-black";
            case "pending":
                return "text-white bg-black/40 border-white/50";
            default:
                return "text-white bg-black/40 border-white/50";
        }
    };

    return (
        <div
            className="w-full h-[600px] flex flex-col items-center justify-center bg-white overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                <div
                    className="absolute w-full h-full flex items-center justify-center"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    <div className="absolute w-24 h-24 rounded-full bg-white flex items-center justify-center z-10 shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-pulse border border-slate-100">
                        <div className="absolute w-32 h-32 rounded-full border border-blue-400/30 animate-ping opacity-70"></div>
                        <div
                            className="absolute w-40 h-40 rounded-full border border-blue-400/10 animate-ping opacity-50"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <img src="/outrelix.png" alt="Outrelix AI Core" className="w-20 h-auto object-contain z-20" />
                    </div>

                    <div className="absolute w-96 h-96 rounded-full border border-slate-200 border-dashed"></div>

                    {timelineData.map((item, index) => {
                        const position = calculateNodePosition(index, timelineData.length);
                        const isExpanded = expandedItems[item.id];
                        const isRelated = isRelatedToActive(item.id);
                        const isPulsing = pulseEffect[item.id];
                        const Icon = item.icon;

                        const nodeStyle = {
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            zIndex: isExpanded ? 200 : position.zIndex,
                            opacity: isExpanded ? 1 : position.opacity,
                        };

                        return (
                            <div
                                key={item.id}
                                ref={(el) => (nodeRefs.current[item.id] = el)}
                                className={`absolute cursor-pointer ${!autoRotate ? "transition-all duration-700" : ""}`}
                                style={nodeStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(item.id);
                                }}
                            >
                                <div
                                    className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""
                                        }`}
                                    style={{
                                        background: `radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)`,
                                        width: `${item.energy * 0.5 + 40}px`,
                                        height: `${item.energy * 0.5 + 40}px`,
                                        left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                        top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                    }}
                                ></div>

                                <div
                                    className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isExpanded
                                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                            : isRelated
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-white text-slate-500"
                                        }
                  border-2 
                  ${isExpanded
                                            ? "border-blue-500"
                                            : isRelated
                                                ? "border-blue-300 animate-pulse"
                                                : "border-slate-200"
                                        }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-125" : "hover:scale-110 hover:border-slate-300 shadow-sm"}
                `}
                                >
                                    <Icon size={16} />
                                </div>

                                <div
                                    className={`
                  absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[11px] font-bold tracking-widest uppercase
                  transition-all duration-300
                  ${isExpanded ? "text-blue-600 translate-y-2 opacity-0" : "text-slate-600"}
                `}
                                >
                                    {item.title}
                                </div>

                                {isExpanded && (
                                    <Card className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl shadow-blue-900/10 overflow-visible z-[999]">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-blue-500/50"></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge
                                                    className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-wider ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-0' :
                                                        item.status === 'in-progress' ? 'bg-blue-100 text-blue-600 border-0 hover:bg-blue-200' :
                                                            'bg-slate-100 text-slate-500 border-0'
                                                        }`}
                                                >
                                                    {item.status.replace('-', ' ')}
                                                </Badge>
                                                <span className="text-[10px] font-mono font-medium text-slate-500">
                                                    {item.date}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base text-slate-900 font-black">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                                            <p>{item.content}</p>

                                            <div className="mt-4 pt-3 border-t border-slate-100">
                                                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                                    <span className="flex items-center text-slate-500">
                                                        <Zap size={10} className="mr-1.5 text-amber-500" />
                                                        System Energy
                                                    </span>
                                                    <span className="font-mono text-blue-600">{item.energy}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative"
                                                        style={{ width: `${item.energy}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-[marquee_1s_linear_infinite]" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {item.relatedIds.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center mb-2.5">
                                                        <Link size={10} className="text-slate-400 mr-1.5" />
                                                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                                            Connected Nodes
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.relatedIds.map((relatedId) => {
                                                            const relatedItem = timelineData.find(
                                                                (i) => i.id === relatedId
                                                            );
                                                            return (
                                                                <Button
                                                                    key={relatedId}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 px-2.5 py-0 text-[10px] font-bold bg-slate-50/50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 transition-all rounded-md text-slate-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleItem(relatedId);
                                                                    }}
                                                                >
                                                                    {relatedItem?.title}
                                                                    <ArrowRight
                                                                        size={10}
                                                                        className="ml-1 opacity-50"
                                                                    />
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
