import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: 'Modular',
        Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                Pion is the first complete C++ development framework designed from the ground up to exclusively use
                C++20 modules.
            </>
        ),
    },
    {
        title: 'Performant',
        Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                Pion embraces the concept of zero-cost abstractions, but manages to still produce extremely powerful,
                easy-to-use APIs with a rich and complete feature set. Get safer, more expressive, and more powerful
                APIs than the STL with even higher performance.
            </>
        ),
    },
    {
        title: 'Portable',
        Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
        description: (
            <>
                Pion's APIs have both breadth and depth, with support for a huge range of functionality beyond the C++
                standard library, and on all major architectures and platforms. Pion supports multiple all major current
                CPU architectures; desktop, server, mobile, and realtime operating systems; and can build natively for
                the web with WebAssembly/WASI.
            </>
        ),
    },
];

function Feature({Svg, title, description}) {
    return (
        <div className={clsx('col col--4')}>
            {/*<div className="text--center">*/}
            {/*    <Svg className={styles.featureSvg} role="img"/>*/}
            {/*</div>*/}
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
