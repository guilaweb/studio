
"use client";

import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface TeamMemberPathProps {
    path: google.maps.LatLngLiteral[];
}

const TeamMemberPath: React.FC<TeamMemberPathProps> = ({ path }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !path || path.length === 0) return;
        
        const memberPath = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#4A90E2',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, strokeColor: '#4A90E2' },
                offset: '100%',
                repeat: '100px'
            }],
        });

        memberPath.setMap(map);

        return () => {
            memberPath.setMap(null);
        };
    }, [map, path]);

    return null;
};

export default TeamMemberPath;

    