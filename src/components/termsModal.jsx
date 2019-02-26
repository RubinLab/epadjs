import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
//import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class TermsModal extends Component {
  render() {
    return (
      <Modal
        {...this.props}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
        animation={false}
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            Software License
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>
            BY CLICKING ON “ACCEPT,” DOWNLOADING, OR OTHERWISE USING EPAD, YOU
            AGREE TO THE FOLLOWING TERMS AND CONDITIONS: STANFORD ACADEMIC
            SOFTWARE SOURCE CODE LICENSE FOR “ePAD Annotation Platform for
            Radiology Images”
          </h6>
          version 1/19/2016
          <hr />
          <p>
            This Agreement covers contributions to and downloads from the ePAD
            project ("ePAD") maintained by The Board of Trustees of the Leland
            Stanford Junior University ("Stanford"). Part A applies to downloads
            of ePAD source code and/or data from ePAD. Part B applies to
            contributions of software and/or data to ePAD (including making
            revisions of or additions to code and/or data already in ePAD),
            which may include source or object code. Your download, copying,
            modifying, displaying, distributing or use of any ePAD software
            and/or data from ePAD (collectively, the "Software") is subject to
            Part A. Your contribution of software and/or data to ePAD (including
            any that occurred prior to the first publication of this Agreement)
            is a "Contribution" subject to Part B. Both Parts A and B shall be
            governed by and construed in accordance with the laws of the State
            of California without regard to principles of conflicts of law. Any
            legal action involving this Agreement or the Research Program will
            be adjudicated in the State of California. This Agreement shall
            supersede and replace any license terms that you may have agreed to
            previously with respect to ePAD. PART A. DOWNLOADING AGREEMENT -
            LICENSE FROM STANFORD WITH RIGHT TO SUBLICENSE ("SOFTWARE LICENSE").
            As used in this Software License, "you" means the individual
            downloading and/or using, reproducing, modifying, displaying and/or
            distributing Software and the institution or entity which employs or
            is otherwise affiliated with you. Stanford hereby grants you, with
            right to sublicense, with respect to Stanford’s rights in the
            Software, a royalty-free, non-exclusive license to use, reproduce,
            make derivative works of, display and distribute the Software,
            provided that: (a) you adhere to all of the terms and conditions of
            this Software License; (b) in connection with any copy, distribution
            of, or sublicense of all or any portion of the Software, the terms
            and conditions in this Software License shall appear in and shall
            apply to such copy and such sublicense, including without limitation
            all source and executable forms and on any user documentation,
            prefaced with the following words: "All or portions of this licensed
            product have been obtained under license from The Board of Trustees
            of the Leland Stanford Junior University. and are subject to the
            following terms and conditions" AND any user interface to the
            Software or the “About” information display in the Software will
            display the following: “Powered by ePAD http://epad.stanford.edu;”
            (c) you preserve and maintain all applicable attributions, copyright
            notices and licenses included in or applicable to the Software; (d)
            modified versions of the Software must be clearly identified and
            marked as such, and must not be misrepresented as being the original
            Software; and (e) you consider making, but are under no obligation
            to make, the source code of any of your modifications to the
            Software freely available to others on an open source basis. The
            license granted in this Software License includes without limitation
            the right to (i) incorporate the Software into your proprietary
            programs (subject to any restrictions applicable to such programs),
            (ii) add your own copyright statement to your modifications of the
            Software, and (iii) provide additional or different license terms
            and conditions in your sublicenses of modifications of the Software;
            provided that in each case your use, reproduction or distribution of
            such modifications otherwise complies with the conditions stated in
            this Software License. This Software License does not grant any
            rights with respect to third party software, except those rights
            that Stanford has been authorized by a third party to grant to you,
            and accordingly you are solely responsible for (i) obtaining any
            permissions from third parties that you need to use, reproduce, make
            derivative works of, display and distribute the Software, and (ii)
            informing your sublicensees, including without limitation your
            end-users, of their obligations to secure any such required
            permissions. You agree that you will use the Software in compliance
            with all applicable laws, policies and regulations including, but
            not limited to, those applicable to Personal Health Information
            (“PHI”) and subject to the Institutional Review Board requirements
            of the your institution, if applicable. The Software has been
            designed for research purposes only and has not been reviewed or
            approved by the Food and Drug Administration or by any other agency.
            YOU ACKNOWLEDGE AND AGREE THAT CLINICAL APPLICATIONS ARE NEITHER
            RECOMMENDED NOR ADVISED. Any commercialization of the Software is at
            the sole risk of the party or parties engaged in such
            commercialization. Any commercialization of the Software is at the
            sole risk of you and the party or parties engaged in such
            commercialization. You further agree to use, reproduce, make
            derivative works of, display and distribute the Software in
            compliance with all applicable governmental laws, regulations and
            orders, including without limitation those relating to export and
            import control. You or your institution, as applicable, will
            indemnify, hold harmless, and defend Stanford against any third
            party claim of any kind made against Stanford arising out of or
            related to the exercise of any rights granted under this Agreement,
            the provision of Software, or the breach of this Agreement. Stanford
            provides the Software AS IS and WITH ALL FAULTS. Stanford makes no
            representations and extends no warranties of any kind, either
            express or implied. Among other things, Stanford disclaims any
            express or implied warranty in the Software: of merchantability, of
            fitness for a particular purpose, of non-infringement or arising out
            of any course of dealing. Title and copyright to the Program and any
            associated documentation shall at all times remain with Stanford,
            and Licensee agrees to preserve same. Stanford reserves the right to
            license the Program at any time for a fee. None of the names, logos
            or trademarks of Stanford or any of Stanford’s affiliates or any of
            the Contributors, or any funding agency, may be used to endorse or
            promote products produced in whole or in part by operation of the
            Software or derived from or based on the Software without specific
            prior written permission from the applicable party. Any use,
            reproduction or distribution of the Software which is not in
            accordance with this Software License shall automatically revoke all
            rights granted to you under this Software License and render
            Paragraphs 1 and 2 of this Software License null and void. This
            Software License does not grant any rights in or to any intellectual
            property owned by Stanford or any Contributor except those rights
            expressly granted hereunder. PART B. CONTRIBUTION AGREEMENT -
            LICENSE TO STANFORD WITH RIGHT TO SUBLICENSE ("CONTRIBUTION
            AGREEMENT"). As used in this Contribution Agreement, "you" means an
            individual providing a Contribution to ePAD and the institution or
            entity which employs or is otherwise affiliated with you. This
            Contribution Agreement applies to all Contributions made to ePAD at
            any time. By making a Contribution you represent that: (i) you are
            legally authorized and entitled by ownership or license to make such
            Contribution and to grant all licenses granted in this Contribution
            Agreement with respect to such Contribution; (ii) if your
            Contribution includes any patient data, all such data is
            de-identified in accordance with U.S. confidentiality and security
            laws and requirements, including but not limited to the Health
            Insurance Portability and Accountability Act (HIPAA) and its
            regulations, and your disclosure of such data for the purposes
            contemplated by this Agreement is properly authorized and in
            compliance with all applicable laws and regulations; and (iii) you
            have preserved in the Contribution all applicable attributions,
            copyright notices and licenses for any third party software or data
            included in the Contribution. Except for the licenses you grant in
            this Agreement, you reserve all right, title and interest in your
            Contribution. You hereby grant to Stanford, with the right to
            sublicense, a perpetual, worldwide, non-exclusive, no charge,
            royalty-free, irrevocable license to use, reproduce, make derivative
            works of, display and distribute the Contribution. If your
            Contribution is protected by patent, you hereby grant to Stanford,
            with the right to sublicense, a perpetual, worldwide, non-exclusive,
            no-charge, royalty-free, irrevocable license under your interest in
            patent rights embodied in the Contribution, to make, have made, use,
            sell and otherwise transfer your Contribution, alone or in
            combination with ePAD or otherwise. You acknowledge and agree that
            Stanford ham may incorporate your Contribution into ePAD and may
            make your Contribution as incorporated available to members of the
            public on an open source basis under terms substantially in
            accordance with the Software License set forth in Part A of this
            Agreement. You further acknowledge and agree that Stanford shall
            have no liability arising in connection with claims resulting from
            your breach of any of the terms of this Agreement. YOU WARRANT THAT
            TO THE BEST OF YOUR KNOWLEDGE YOUR CONTRIBUTION DOES NOT CONTAIN ANY
            CODE OBTAINED BY YOU UNDER AN OPEN SOURCE LICENSE THAT REQUIRES OR
            PRESCRIBES DISTRBUTION OF DERIVATIVE WORKS UNDER SUCH OPEN SOURCE
            LICENSE. (By way of non-limiting example, you will not contribute
            any code obtained by you under the GNU General Public License or
            other so-called "reciprocal" license.)
          </p>
          BY CLICKING ON “ACCEPT,” DOWNLOADING, OR OTHERWISE USING EPAD, YOU
          AGREE TO THE FOLLOWING TERMS AND CONDITIONS: Stanford ACADEMIC
          SOFTWARE LICENSE AGREEMENT FOR “ePAD Annotation Platform for Radiology
          Images and Plugins” version 1/19/2016 This License Agreement
          (“Agreement”) is by and between the party identified below
          (“Licensee”) and The Board of Trustees of the Leland Stanford Junior
          University (“Stanford”). “ePAD Annotation Platform for Radiology
          Images” includes Web Services and core platform for managing images
          and image annotations. “ePAD Plugins” include the ePAD Viewer and
          server-side software modules for processing imaging data, including
          any accompanying information, materials or manuals (collectively
          “Program”), Licensee agrees to be bound by the terms of this
          Agreement. If you do not agree to the terms of this Agreement, do not
          accept the terms of this License Agreement; if you have downloaded the
          Program, immediately delete it from your system. Stanford grants to
          Licensee a royalty-free, nonexclusive, and nontransferable license to
          use the Program furnished hereunder upon the terms and conditions set
          out below. Licensee shall have no right in the intellectual property
          of Stanford not expressly licensed under this Agreement, including but
          not limited to inventions and patents or patent applications. Licensee
          acknowledges that the Program is a research tool in development that
          it is provided hereunder as is, without any accompanying services,
          support, error corrections or improvements from Stanford. Licensee
          warrants that Licensee will not remove or export any part of the
          Program from the United States except in full compliance with all
          United States and other applicable laws and regulations. Licensee will
          use the Program in compliance with all applicable laws, policies and
          regulations including, but not limited to, those applicable to
          Personal Health Information (“PHI”) and subject to the Institutional
          Review Board requirements of the Licensee’s institution, if
          applicable. The Software has been designed for research purposes only
          and has not been reviewed or approved by the Food and Drug
          Administration or by any other agency. YOU ACKNOWLEDGE AND AGREE THAT
          CLINICAL APPLICATIONS ARE NEITHER RECOMMENDED NOR ADVISED. Any
          commercialization of the Software is at the sole risk of the party or
          parties engaged in such commercialization. Licensee will indemnify,
          hold harmless, and defend Stanford against any third party claim of
          any kind made against Stanford arising out of or related to the
          exercise of any rights granted under this Agreement, the provision of
          Licensee Derivatives, or the breach of this Agreement by Licensee.
          Stanford provides the Program AS IS and WITH ALL FAULTS. Stanford
          makes no representations and extends no warranties of any kind, either
          express or implied. Among other things, Stanford disclaims any express
          or implied warranty: of merchantability, of fitness for a particular
          purpose, of non-infringement or arising out of any course of dealing.
          Title and copyright to the Program and any associated documentation
          shall at all times remain with Stanford, and Licensee agrees to
          preserve same. Stanford reserves the right to terminate this Agreement
          by email notice at any time upon determination that Licensee has
          breached the terms. Upon receipt of such notice, Licensee agrees to
          discontinue use of the Program and delete or destroy all copies. This
          Agreement is governed by the laws of the State of California, without
          regard to its conflict of laws doctrine. Any legal action involving
          this Agreement or the Research Program will be adjudicated in the
          State of California.
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-primary" onClick={this.props.onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default TermsModal;
