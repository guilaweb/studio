
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sun, Trash2 } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ThreeJSOverlayView, useMap } from '@vis.gl/react-google-maps';

const GLB_URL = 'https://storage.googleapis.com/munitu-assets/building_model.glb';
const INITIAL_POSITION = { lat: -8.8145, lng: 13.2307 };

export default function ShadowSimulator({ map }: { map: google.maps.Map | null }) {
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [building, setBuilding] = useState<THREE.Group | null>(null);
    const [isBuildingVisible, setIsBuildingVisible] = useState(false);
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        if (!map) return;

        const newScene = new THREE.Scene();
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        newScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.75);
        directionalLight.position.set(0.5, -1, 0.5);
        newScene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(GLB_URL, (gltf) => {
            const model = gltf.scene;
            model.scale.set(15, 15, 15);
            model.rotation.set(0, -Math.PI / 2, 0);
            model.visible = false; // Initially hidden
            newScene.add(model);
            setBuilding(model);
        });

        setScene(newScene);

    }, [map]);
    
    const handleToggleBuilding = () => {
        if (building) {
            building.visible = !building.visible;
            setIsBuildingVisible(building.visible);
        }
    };
    
    const handleDateTimeChange = (hour: number) => {
        const newDateTime = new Date();
        newDateTime.setHours(hour);
        setDateTime(newDateTime);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" /> Simulador de Sombreamento</CardTitle>
                    <CardDescription>Adicione um edifício virtual para analisar o seu impacto solar na vizinhança.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleToggleBuilding} className="w-full">
                        {isBuildingVisible ? 'Remover Edifício Virtual' : 'Adicionar Edifício Virtual'}
                    </Button>
                    {isBuildingVisible && (
                        <div className="space-y-4 pt-2">
                             <Label>Hora do Dia: {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Label>
                            <Slider
                                defaultValue={[12]}
                                min={6}
                                max={18}
                                step={1}
                                onValueChange={(value) => handleDateTimeChange(value[0])}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            {scene && map && (
                <ThreeJSOverlayView
                    map={map}
                    scene={scene}
                    anchor={INITIAL_POSITION}
                >
                    {/* The 3D content is rendered by three.js */}
                </ThreeJSOverlayView>
            )}
        </>
    );
}

    