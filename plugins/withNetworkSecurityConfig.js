const { withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withNetworkSecurityConfig = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Agregar usesCleartextTraffic al application
    if (!mainApplication.$) {
      mainApplication.$ = {};
    }
    mainApplication.$['android:usesCleartextTraffic'] = 'true';

    // Agregar networkSecurityConfig
    if (!mainApplication.$['android:networkSecurityConfig']) {
      mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }

    // Crear el archivo network_security_config.xml
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.0.0</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
        <domain includeSubdomains="true">192.168.100.0</domain>
        <domain includeSubdomains="true">10.0.0.0</domain>
    </domain-config>
</network-security-config>`;

    // El archivo se creará durante el prebuild
    config.modResults.networkSecurityConfig = xmlContent;

    return config;
  });
};

module.exports = withNetworkSecurityConfig;



